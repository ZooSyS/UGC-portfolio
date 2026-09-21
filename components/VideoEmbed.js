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
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !url) return;

    const container = containerRef.current;
    container.innerHTML = "";

    let cleanUrl = url
      .replace(/^https?:\/\/t\.me\//, "")
      .split("?")[0];

    const parts = cleanUrl.split("/");

    if (parts.length === 3) {
      cleanUrl = parts[0] + "/" + parts[2];
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://telegram.org/js/telegram-widget.js?24";
    script.setAttribute("data-telegram-post", cleanUrl);
    script.setAttribute("data-width", "100%");
    script.setAttribute("data-userpic", "false");

    container.appendChild(script);
  }, [url]);

  return <div ref={containerRef} className="telegram-frame" />;
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
