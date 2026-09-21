"use client";

import { useEffect, useRef, useState } from "react";

function normalizeTelegramUrl(url) {
  const clean = url.replace(/^https?:\/\/t\.me\//, "").split("?")[0].replace(/\/$/, "");
  const parts = clean.split("/");
  if (parts.length === 3) return `https://t.me/${parts[0]}/${parts[2]}`;
  return `https://t.me/${clean}`;
}

export default function VideoEmbed({ platform, url }) {
  const containerRef = useRef(null);
  const [telegramMedia, setTelegramMedia] = useState(null);

  useEffect(() => {
    if (platform !== "Telegram" || !url) return;

    let cancelled = false;

    fetch(`/api/telegram-media?url=${encodeURIComponent(normalizeTelegramUrl(url))}`)
      .then((response) => {
        if (!response.ok) throw new Error("Telegram media request failed");
        return response.json();
      })
      .then((data) => {
        if (!cancelled) setTelegramMedia(data);
      })
      .catch(() => {
        if (!cancelled) setTelegramMedia({ fallback: true });
      });

    return () => {
      cancelled = true;
    };
  }, [platform, url]);

  useEffect(() => {
    if (!containerRef.current || !url) return;

    const container = containerRef.current;
    container.innerHTML = "";
    container.className = "";

    // TELEGRAM — extract the public media URL and use our own player.
    if (platform === "Telegram") {
      if (!telegramMedia) {
        container.className = "video-frame telegram-loading";
        return;
      }

      if (telegramMedia.video) {
        container.className = "video-frame telegram-video-frame";
        const video = document.createElement("video");
        video.src = telegramMedia.video;
        video.controls = true;
        video.playsInline = true;
        video.preload = "metadata";
        if (telegramMedia.poster) video.poster = telegramMedia.poster;
        container.appendChild(video);
        return;
      }

      container.className = "telegram-fallback";
      container.innerHTML = `<a href="${normalizeTelegramUrl(url)}" target="_blank" rel="noreferrer">Открыть видео в Telegram ↗</a>`;
      return;
    }

    // INSTAGRAM
    if (platform === "Instagram") {
      container.className = "instagram-frame";
      const blockquote = document.createElement("blockquote");
      blockquote.className = "instagram-media";
      blockquote.setAttribute("data-instgrm-permalink", url);
      blockquote.setAttribute("data-instgrm-version", "14");
      blockquote.style.width = "100%";
      blockquote.style.minWidth = "0";
      blockquote.style.margin = "0";
      container.appendChild(blockquote);

      const existing = document.querySelector('script[src="https://www.instagram.com/embed.js"]');
      const process = () => window.instgrm?.Embeds?.process?.();

      if (existing) {
        if (window.instgrm) process();
        else existing.addEventListener("load", process, { once: true });
      } else {
        const script = document.createElement("script");
        script.async = true;
        script.src = "https://www.instagram.com/embed.js";
        script.onload = process;
        document.body.appendChild(script);
      }
      return;
    }

    // YOUTUBE
    if (platform === "YouTube" || /youtube\.com\/|youtu\.be\//i.test(url)) {
      try {
        const parsed = new URL(url);
        let videoId = parsed.searchParams.get("v");
        if (!videoId && parsed.hostname.includes("youtu.be")) videoId = parsed.pathname.slice(1);
        if (!videoId) return;

        container.className = "video-frame";
        const iframe = document.createElement("iframe");
        iframe.src = `https://www.youtube.com/embed/${videoId}`;
        iframe.title = "UGC video";
        iframe.loading = "lazy";
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.allowFullscreen = true;
        container.appendChild(iframe);
      } catch {}
      return;
    }

    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    container.className = "video-frame";
    container.appendChild(video);
  }, [platform, url, telegramMedia]);

  return <div ref={containerRef} style={{ width: "100%" }} />;
}
