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
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'");
}

export async function GET(request) {
  try {
    const input = request.nextUrl.searchParams.get("url");
    const telegramUrl = normalizeTelegramUrl(input);
    if (!telegramUrl) return new NextResponse("Invalid Telegram URL", { status: 400 });

    const page = await fetch(telegramUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; UGCPortfolio/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    });

    if (!page.ok) return new NextResponse("Telegram post unavailable", { status: 502 });

    const html = await page.text();
    const poster =
      html.match(/<meta[^>]+property=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["'](?:og:image|twitter:image)["']/i)?.[1];

    if (!poster) return new NextResponse("Preview unavailable", { status: 404 });

    const image = await fetch(decodeHtml(poster), {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store",
    });

    if (!image.ok) return new NextResponse("Preview image unavailable", { status: 502 });

    return new NextResponse(await image.arrayBuffer(), {
      headers: {
        "Content-Type": image.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch {
    return new NextResponse("Preview failed", { status: 500 });
  }
}
