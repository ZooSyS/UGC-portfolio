import { NextResponse } from "next/server";

function normalizeTelegramUrl(raw) {
  const value = String(raw || "").trim();
  if (!/^https?:\/\/t\.me\//i.test(value)) return null;
  const url = new URL(value);
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts[0] === "s") parts.shift();
  if (parts.length < 2) return null;
  const channel = parts[0];
  const messageId = parts[parts.length - 1];
  if (!/^[A-Za-z0-9_+-]+$/.test(channel) || !/^\d+$/.test(messageId)) return null;
  return `https://t.me/${channel}/${messageId}?embed=1`;
}

function decodeHtml(value) {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'");
}

export async function GET(request) {
  try {
    const input = request.nextUrl.searchParams.get("url");
    const telegramUrl = normalizeTelegramUrl(input);
    if (!telegramUrl) return NextResponse.json({ error: "invalid_url" }, { status: 400 });

    const page = await fetch(telegramUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; UGCPortfolio/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    });

    const html = await page.text();
    const poster =
      html.match(/<meta[^>]+property=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["'](?:og:image|twitter:image)["']/i)?.[1] ||
      null;

    if (!poster) {
      return NextResponse.json({
        stage: "telegram_html",
        telegramStatus: page.status,
        htmlLength: html.length,
        hasOgImage: false,
      }, { status: 404 });
    }

    const posterUrl = decodeHtml(poster);
    const image = await fetch(posterUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        Referer: "https://t.me/",
      },
      cache: "no-store",
    });

    if (!image.ok) {
      return NextResponse.json({
        stage: "telegram_cdn",
        telegramStatus: page.status,
        posterUrl,
        imageStatus: image.status,
        contentType: image.headers.get("content-type"),
      }, { status: 502 });
    }

    return new NextResponse(await image.arrayBuffer(), {
      headers: {
        "Content-Type": image.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    return NextResponse.json({
      stage: "exception",
      error: error instanceof Error ? error.message : "unknown",
    }, { status: 500 });
  }
}
