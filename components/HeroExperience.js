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
  const morphRef = useRef({ x: 0, y: 0, scale: 0.12 });
  const introRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = hero.getBoundingClientRect();
      const travel = Math.max(hero.offsetHeight * 0.62, window.innerHeight * 0.62);
      const progress = Math.min(1, Math.max(0, -rect.top / travel));

      hero.style.setProperty("--hero-progress", progress.toFixed(3));
      hero.style.setProperty("--hero-morph", Math.min(1, Math.max(0, (progress - 0.04) / 0.72)).toFixed(3));
      document.documentElement.style.setProperty("--hero-progress", progress.toFixed(3));
      const title = titleRef.current;
      if (title && !morphRef.current.ready) {
        const rectTitle = title.getBoundingClientRect();
        morphRef.current = {
          ready: true,
          x: window.innerWidth * 0.05 - rectTitle.left,
          y: 28 - rectTitle.top,
          scale: 18 / Math.max(rectTitle.height, 1),
        };
        title.style.setProperty("--morph-x", morphRef.current.x + "px");
        title.style.setProperty("--morph-y", morphRef.current.y + "px");
        title.style.setProperty("--morph-scale", morphRef.current.scale.toFixed(4));
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    requestAnimationFrame(() => hero.classList.add("hero-ready"));
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

      <div className="hero-morph-logo" aria-hidden="true">
        YULIANA<span>.</span>
      </div>

      {image && <img className="hero-image" src={image} alt="" />}

      <div className="hero-note">
        <span>01</span>
        <p>Не просто показать продукт.<br />Показать его в жизни.</p>
      </div>
    </section>
  );
}
