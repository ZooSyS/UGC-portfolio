"use client";

import { useEffect, useRef } from "react";

export default function HeroExperience({ title, text, button, image }) {
  const heroRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      hero.style.setProperty("--hero-progress", "0");
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add("hero-ready")));
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="hero" id="top" ref={heroRef}>
      <div className="hero-grid-line" aria-hidden="true" />
      <div className="hero-copy">
        <p className="eyebrow hero-eyebrow">UGC CREATOR · CONTENT · REVIEWS</p>
        <div className="hero-title-intro">
          <h1 className="hero-title">{title || "Контент, которому верят."}</h1>
        </div>
        <p className="hero-text">
          {text || "Создаю живые видео для брендов — от распаковок и обзоров до нативных lifestyle-сюжетов."}
        </p>
        <a className="button" href="#work">
          {button || "Смотреть работы"} <span>↓</span>
        </a>
      </div>

      {image && (
        <div className="hero-visual">
          <div className="hero-visual-label">YULIANA / UGC</div>
          <img className="hero-image" src={image} alt="" />
          <div className="hero-visual-index">01</div>
        </div>
      )}

      <div className="hero-note">
        <span>01</span>
        <p>Не просто показать продукт.<br />Показать его в жизни.</p>
      </div>
    </section>
  );
}
