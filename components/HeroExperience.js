"use client";

import { useEffect, useRef } from "react";

export default function HeroExperience({
  title,
  text,
  button,
  image,
}) {
  const heroRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    const titleNode = titleRef.current;
    if (!hero || !titleNode) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = hero.getBoundingClientRect();
      const travel = Math.max(hero.offsetHeight * 0.62, window.innerHeight * 0.62);
      const progress = Math.min(1, Math.max(0, -rect.top / travel));

      hero.style.setProperty("--hero-progress", progress.toFixed(3));
      document.documentElement.style.setProperty("--hero-progress", progress.toFixed(3));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
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
      <div className="hero-copy">
        <p className="eyebrow hero-eyebrow">UGC CREATOR · CONTENT · REVIEWS</p>
        <h1 ref={titleRef} className="hero-title">
          {title || "Контент, которому верят."}
        </h1>
        <p className="hero-text">
          {text || "Создаю живые видео для брендов — от распаковок и обзоров до нативных lifestyle-сюжетов."}
        </p>
        <a className="button" href="#work">
          {button || "Смотреть работы"} <span>↓</span>
        </a>
      </div>

      {image && (
        <img className="hero-image" src={image} alt="" />
      )}

      <div className="hero-note">
        <span>01</span>
        <p>Не просто показать продукт.<br />Показать его в жизни.</p>
      </div>
    </section>
  );
}
