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

    // Public Telegram video posts expose the media as a regular <video src="..."> tag.
    // Keep extraction intentionally simple: find the video tag and read its src.
    const videoTag = html.match(/<video\b[^>]*>/i)?.[0];

    const video =
      videoTag?.match(/\bsrc=["']([^"']+)["']/i)?.[1] ||
      videoTag?.match(/\bdata-src=["']([^"']+)["']/i)?.[1] ||
      null;

    const width = videoTag?.match(/\bwidth=["'](\d+(?:\.\d+)?)["']/i)?.[1] || null;
    const height = videoTag?.match(/\bheight=["'](\d+(?:\.\d+)?)["']/i)?.[1] || null;

    const posterStyle =
      videoTag?.match(/\bposter=["']([^"']+)["']/i)?.[1] ||
      html.match(/<meta[^>]+property=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
      null;

    if (!video) {
      const videoIndex = html.toLowerCase().indexOf("<video");
      return NextResponse.json(
        {
          error: "No public video found",
          htmlLength: html.length,
          videoIndex,
          videoWrapIndex: html.toLowerCase().indexOf("tgme_widget_message_video"),
          telescoIndex: html.toLowerCase().indexOf("telesco.pe"),
          mp4Index: html.toLowerCase().indexOf(".mp4"),
          snippet: (() => {
            const index = Math.max(
              videoIndex,
              html.toLowerCase().indexOf("tgme_widget_message_video"),
              html.toLowerCase().indexOf("telesco.pe"),
              html.toLowerCase().indexOf(".mp4")
            );
            return index >= 0
              ? html.slice(Math.max(0, index - 800), index + 3000)
              : html.slice(0, 1500);
          })(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        video: decodeHtml(video),
        poster: posterStyle ? decodeHtml(posterStyle) : null,
        width: width ? Number(width) : null,
        height: height ? Number(height) : null,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=300",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Telegram extraction failed" },
      { status: 500 }
    );
  }
}
