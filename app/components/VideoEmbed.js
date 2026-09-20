"use client";

import { useEffect, useRef } from "react";

export default function VideoEmbed({ platform, url }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !url) return;

    const container = containerRef.current;
    container.innerHTML = "";

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

    // OTHER
    const message = document.createElement("div");

    message.textContent =
      "Плеер для " +
      (platform || "этой платформы") +
      " пока не настроен";

    message.style.padding = "40px 20px";
    message.style.textAlign = "center";
    message.style.background = "#f3f3f3";
    message.style.borderRadius = "12px";

    container.appendChild(message);
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