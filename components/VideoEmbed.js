"use client";

import { useEffect, useRef, useState } from "react";

let instagramEmbedPromise = null;

function normalizeTelegramUrl(url) {
  const clean = url.replace(/^https?:\/\/t\.me\//, "").split("?")[0].replace(/\/$/, "");
  const parts = clean.split("/");
  if (parts.length === 3) return `https://t.me/${parts[0]}/${parts[2]}`;
  return `https://t.me/${clean}`;
}

function loadInstagramEmbed() {
  if (window.instgrm?.Embeds?.process) {
    return Promise.resolve(window.instgrm);
  }

  if (instagramEmbedPromise) {
    return instagramEmbedPromise;
  }

  const src = "https://www.instagram.com/embed.js";
  const existing = document.querySelector(`script[src="${src}"]`);

  if (existing) {
    instagramEmbedPromise = new Promise((resolve, reject) => {
      const finish = () => {
        if (window.instgrm?.Embeds?.process) {
          resolve(window.instgrm);
        } else {
          reject(new Error("Instagram SDK loaded without window.instgrm"));
        }
      };

      existing.addEventListener("load", finish, { once: true });
      existing.addEventListener("error", () => reject(new Error("Instagram SDK failed to load")), { once: true });

      if (window.instgrm?.Embeds?.process) finish();
    });

    return instagramEmbedPromise;
  }

  instagramEmbedPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.async = true;
    script.src = src;

    script.onload = () => {
      if (window.instgrm?.Embeds?.process) {
        resolve(window.instgrm);
      } else {
        reject(new Error("Instagram SDK loaded without window.instgrm"));
      }
    };

    script.onerror = () => reject(new Error("Instagram SDK failed to load"));
    document.body.appendChild(script);
  });

  return instagramEmbedPromise;
}

export default function VideoEmbed({ platform, url }) {
  const containerRef = useRef(null);
  const [telegramMedia, setTelegramMedia] = useState(null);

  useEffect(() => {
    if (platform !== "Telegram" || !url) return;

    let cancelled = false;

    fetch(`/api/telegram-media?url=${encodeURIComponent(normalizeTelegramUrl(url))}`, {
      signal: AbortSignal.timeout(12000),
    })
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

    if (platform === "Telegram") {
      if (!telegramMedia) {
        container.className = "video-frame telegram-loading";
        return;
      }

      if (telegramMedia.video) {
        container.className = "video-frame telegram-video-frame";
        if (telegramMedia.width && telegramMedia.height) {
          container.style.aspectRatio = `${telegramMedia.width} / ${telegramMedia.height}`;
        }
        const video = document.createElement("video");
        video.src = telegramMedia.video;
        video.controls = true;
        video.playsInline = true;
        video.preload = "metadata";
        if (telegramMedia.poster) video.poster = telegramMedia.poster;

        if (telegramMedia.poster) {
          const preview = document.createElement("img");
          preview.src = telegramMedia.poster;
          preview.alt = "";
          preview.className = "telegram-preview";
          preview.addEventListener("error", () => {
            preview.remove();
          });

          video.addEventListener("play", () => {
            preview.classList.add("is-hidden");
          });
          video.addEventListener("pause", () => {
            if (video.currentTime === 0) preview.classList.remove("is-hidden");
          });

          container.appendChild(preview);
        }

        container.appendChild(video);
        return;
      }

      container.className = "telegram-fallback";
      container.innerHTML = `<a href="${normalizeTelegramUrl(url)}" target="_blank" rel="noreferrer">Открыть видео в Telegram ↗</a>`;
      return;
    }

    if (platform === "Instagram") {
      container.className = "instagram-frame";
      container.dataset.loading = "true";

      const blockquote = document.createElement("blockquote");
      blockquote.className = "instagram-media";
      blockquote.setAttribute("data-instgrm-permalink", url);
      blockquote.setAttribute("data-instgrm-version", "14");
      blockquote.style.width = "100%";
      blockquote.style.minWidth = "0";
      blockquote.style.margin = "0";
      container.appendChild(blockquote);

      loadInstagramEmbed()
        .then((instagram) => {
          if (!container.isConnected) return;
          instagram.Embeds.process();
          container.dataset.loading = "false";
        })
        .catch(() => {
          if (!container.isConnected) return;
          container.dataset.loading = "false";
        });

      return;
    }

    if (platform === "YouTube" || /youtube\.com\/|youtu\.be\//i.test(url)) {
      try {
        const parsed = new URL(url);
        let videoId = parsed.searchParams.get("v");

        if (!videoId && parsed.hostname.includes("youtu.be")) {
          videoId = parsed.pathname.slice(1);
        }

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
