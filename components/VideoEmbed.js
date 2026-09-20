"use client";

import { useEffect, useRef } from "react";

function InstagramEmbed({ url }) {
  const ref = useRef(null);

  useEffect(() => {
    const render = () => window.instgrm?.Embeds?.process();

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
    <div className="video-frame instagram-frame" ref={ref}>
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

export default function VideoEmbed({ url }) {
  if (!url) return null;

  if (/instagram\.com\//i.test(url)) {
    return <InstagramEmbed url={url} />;
  }

  if (/youtube\.com\/|youtu\.be\//i.test(url)) {
    return <YouTubeEmbed url={url} />;
  }

  return (
    <div className="video-frame">
      <video src={url} controls playsInline preload="metadata" />
    </div>
  );
}
