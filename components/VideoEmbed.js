"use client";

import { useEffect, useRef } from "react";

function InstagramEmbed({ url }) {
  const ref = useRef(null);

  useEffect(() => {
    const render = () => window.instgrm?.Embeds?.process(ref.current);
    if (!document.querySelector('script[src="https://www.instagram.com/embed.js"]')) {
      const script = document.createElement("script");
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      script.onload = render;
      document.body.appendChild(script);
    } else {
      render();
    }
  }, [url]);

  return (
    <div className="instagram-frame" ref={ref}>
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
      />
    </div>
  );
}

function YouTubeEmbed({ url }) {
  try {
    const parsed = new URL(url);
    let videoId = parsed.searchParams.get("v");

    if (!videoId && parsed.hostname.includes("youtu.be")) {
      videoId = parsed.pathname.slice(1);
    }

    if (!videoId) return null;

    return (
      <div className="video-frame">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="UGC video"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  } catch {
    return null;
  }
}

function TelegramEmbed({ url }) {
  const parsed = (() => {
    try {
      const value = new URL(url);
      const parts = value.pathname.split("/").filter(Boolean);
      const isForumMessage = parts.length >= 3 && /^\\d+$/.test(parts[1]) && /^\\d+$/.test(parts[2]);
      return {
        username: parts[0] || "",
        messageId: isForumMessage ? parts[2] : parts[1] || "",
      };
    } catch {
      return { username: "", messageId: "" };
    }
  })();

  useEffect(() => {
    if (!parsed.username || !parsed.messageId) return;

    const container = document.getElementById(
      `telegram-embed-${parsed.username}-${parsed.messageId}`
    );
    if (!container) return;

    container.innerHTML = "";

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-post", `${parsed.username}/${parsed.messageId}`);
    script.setAttribute("data-width", "100%");
    script.setAttribute("data-userpic", "false");
    container.appendChild(script);
  }, [parsed.username, parsed.messageId]);

  if (!parsed.username || !parsed.messageId) return null;

  return (
    <div
      id={`telegram-embed-${parsed.username}-${parsed.messageId}`}
      className="telegram-frame"
    />
  );
}

export default function VideoEmbed({ url }) {
  if (!url) return null;

  if (/instagram\.com\//i.test(url)) {
    return <InstagramEmbed url={url} />;
  }

  if (/youtube\.com\/|youtu\.be\//i.test(url)) {
    return <YouTubeEmbed url={url} />;
  }

  if (/(^https?:\/\/)?(www\.)?t\.me\//i.test(url) || /telegram\.me\//i.test(url)) {
    return <TelegramEmbed url={url} />;
  }

  return (
    <div className="video-frame">
      <video src={url} controls playsInline preload="metadata" />
    </div>
  );
}
