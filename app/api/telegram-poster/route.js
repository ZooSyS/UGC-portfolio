import { NextResponse } from "next/server";

function parseTelegramUrl(raw) {
  const value = String(raw || "").trim();
  if (!/^https?:\/\/t\.me\//i.test(value)) return null;
  const url = new URL(value);
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts[0] === "s") parts.shift();
  if (parts.length < 2) return null;
  const channel = parts[0];
  const messageId = parts[parts.length - 1];
  if (!/^[A-Za-z0-9_+-]+$/.test(channel) || !/^\d+$/.test(messageId)) return null;
  return { channel, messageId };
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "");
}

function extractImage(html) {
  const patterns = [
    /<meta[^>]+property=["'](?:og:image|og:image:url)["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["'](?:og:image|og:image:url)["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtml(match[1]);
  }

  return null;
}

export async function GET(request) {
  try {
    const input = request.nextUrl.searchParams.get("url");
    const parsed = parseTelegramUrl(input);
    if (!parsed) return NextResponse.json({ error: "invalid_url" }, { status: 400 });

    const urls = [
      `https://t.me/${parsed.channel}/${parsed.messageId}`,
      `https://t.me/s/${parsed.channel}/${parsed.messageId}`,
    ];

    const diagnostics = [];

    for (const telegramUrl of urls) {
      const page = await fetch(telegramUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; UGCPortfolio/1.0)",
          Accept: "text/html,application/xhtml+xml",
        },
        cache: "no-store",
      });

      const html = await page.text();
      const poster = extractImage(html);

      diagnostics.push({
        url: telegramUrl,
        status: page.status,
        htmlLength: html.length,
        posterFound: Boolean(poster),
        posterHost: poster ? (() => { try { return new URL(poster).hostname; } catch { return null; } })() : null,
      });

      if (!poster) continue;

      const image = await fetch(poster, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          Referer: "https://t.me/",
        },
        cache: "no-store",
      });

      diagnostics[diagnostics.length - 1].imageStatus = image.status;
      diagnostics[diagnostics.length - 1].imageType = image.headers.get("content-type");

      if (image.ok) {
        return new NextResponse(await image.arrayBuffer(), {
          headers: {
            "Content-Type": image.headers.get("content-type") || "image/jpeg",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        });
      }
    }

    return NextResponse.json({
      stage: "no_working_preview",
      diagnostics,
    }, { status: 404 });
  } catch (error) {
    return NextResponse.json({
      stage: "exception",
      error: error instanceof Error ? error.message : "unknown",
    }, { status: 500 });
  }
}
