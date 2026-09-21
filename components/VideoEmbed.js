"use client";

import { useEffect, useRef } from "react";

export default function VideoEmbed({ platform, url }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !url) return;

    const container = containerRef.current;
    container.innerHTML = "";
    container.className = platform === "Telegram" ? "telegram-frame" : platform === "Instagram" ? "instagram-frame" : "";

    // TELEGRAM
    if (platform === "Telegram") {
      let cleanUrl = url
        .replace(/^https?:\/\/t\.me\//, "")
        .split("?")[0];

      const parts = cleanUrl.split("/");

      // Telegram forum link:
      // yuliana_m_portfolio/5/6
      // превращаем в:
      // yuliana_m_portfolio/6
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

      return;
    }

    // INSTAGRAM
    if (platform === "Instagram") {
      const blockquote = document.createElement("blockquote");

      blockquote.className = "instagram-media";
      blockquote.setAttribute("data-instgrm-permalink", url);
      blockquote.setAttribute("data-instgrm-version", "14");

      blockquote.style.width = "100%";
      blockquote.style.minWidth = "0";
      blockquote.style.margin = "0";

      container.appendChild(blockquote);

      const script = document.createElement("script");

      script.async = true;
      script.src = "https://www.instagram.com/embed.js";

      script.onload = function () {
        if (window.instgrm) {
          window.instgrm.Embeds.process();
        }
      };

      document.body.appendChild(script);

      return;
    }

    // YOUTUBE
    if (platform === "YouTube" || /youtube\.com\/|youtu\.be\//i.test(url)) {
      try {
        const parsed = new URL(url);
        let videoId = parsed.searchParams.get("v");

        if (!videoId && parsed.hostname.includes("youtu.be")) {
          videoId = parsed.pathname.slice(1);
        }

        if (!videoId) return;

        const iframe = document.createElement("iframe");
        iframe.src = `https://www.youtube.com/embed/${videoId}`;
        iframe.title = "UGC video";
        iframe.loading = "lazy";
        iframe.allow =
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.allowFullscreen = true;

        const frame = document.createElement("div");
        frame.className = "video-frame";
        frame.appendChild(iframe);
        container.appendChild(frame);
      } catch {
        return;
      }

      return;
    }

    // OTHER
    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";

    const frame = document.createElement("div");
    frame.className = "video-frame";
    frame.appendChild(video);
    container.appendChild(frame);
  }, [platform, url]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
      }}
    />
  );
}
