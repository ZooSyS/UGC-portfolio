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

  return `https://t.me/s/${channel}/${messageId}`;
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

    if (!telegramUrl) {
      return NextResponse.json({ error: "Invalid Telegram URL" }, { status: 400 });
    }

    const response = await fetch(telegramUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; UGCPortfolio/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Telegram post unavailable" }, { status: 502 });
    }

    const html = await response.text();

    const messagePattern = new RegExp(
      `<div[^>]+class=["'][^"']*tgme_widget_message_wrap[^"']*["'][\\s\\S]*?<a[^>]+href=["']https?:\\/\\/t\\.me\\/[^"']*\\/${telegramUrl.split("/").pop()}["'][\\s\\S]*?<\\/div>`,
      "i"
    );
    const messageHtml = html.match(messagePattern)?.[0] || html;

    const video =
      messageHtml.match(/<video[^>]+class=["'][^"']*tgme_widget_message_video[^"']*["'][^>]+src=["']([^"']+)/i)?.[1] ||
      messageHtml.match(/<video[^>]+src=["']([^"']+)["']/i)?.[1];

    const posterStyle =
      messageHtml.match(/tgme_widget_message_video_thumb[^>]*style=["'][^"']*background-image:\s*url\((?:'|")?([^)'"]+)/i)?.[1] ||
      null;

    if (!video) {
      return NextResponse.json({ error: "No public video found" }, { status: 404 });
    }

    return NextResponse.json({
      video: decodeHtml(video),
      poster: posterStyle ? decodeHtml(posterStyle) : null,
    }, {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Telegram extraction failed" },
      { status: 500 }
    );
  }
}
