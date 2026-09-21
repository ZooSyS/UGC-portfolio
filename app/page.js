import VideoEmbed from "../components/VideoEmbed";
import HeroExperience from "../components/HeroExperience";

import { getSiteData } from "../lib/notion";

function first(value, fallback = "") {
  if (Array.isArray(value)) return value[0] || fallback;
  return value || fallback;
}

function text(value, fallback = "") {
  if (Array.isArray(value)) return value.join("\n");
  return value || fallback;
}

function ServiceIcon({ index }) {
  const icons = [
    <><circle cx="12" cy="12" r="7"/><path d="M12 5v14M5 12h14"/></>,
    <><rect x="5" y="5" width="14" height="14" rx="2"/><path d="m8 15 3-4 2 2 2-3"/></>,
    <><path d="M7 4h10v16H7z"/><path d="M9 7h6M9 10h6M9 13h3"/></>,
    <><path d="M5 7h14v10H5z"/><path d="m10 10 5 2-5 2z"/></>,
  ];
  return <svg className="service-icon" viewBox="0 0 24 24" aria-hidden="true">{icons[index % icons.length]}</svg>;
}

export default async function Home() {
  const { projects: notionProjects = [], content = {} } = await getSiteData();

  const projects = notionProjects
    .map((page) => {
      const properties = page.properties || {};

      const textProperty = (property) => {
        if (!property) return "";

        if (property.type === "title") {
          return property.title?.map((item) => item.plain_text || "").join("") || "";
        }

        if (property.type === "rich_text") {
          return property.rich_text?.map((item) => item.plain_text || "").join("") || "";
        }

        if (property.type === "url") return property.url || "";
        if (property.type === "select") return property.select?.name || "";
        if (property.type === "multi_select") {
          return property.multi_select?.map((item) => item.name).join(", ") || "";
        }

        return "";
      };

      return {
        id: page.id,
        title: textProperty(properties["Название"]),
        platform: textProperty(properties["Платформа"]),
        video: textProperty(properties["Ссылка"]),
      };
    })
    .filter((project) => project.video);

  const hero = content.hero || {};
  const about = content.about || {};
  const contact = content.contact || {};
  const footer = content.footer || {};

  const heroImage = first(hero.image);
  const aboutImage = first(about.image);
  const contactEmail = first(contact.email, "hello@example.com");
  const contactTelegram = first(contact.telegram);
  const contactInstagram = first(contact.instagram);
  const formats = Array.isArray(content.formats?.item) ? content.formats.item : (content.formats?.item ? [content.formats.item] : []);
  const niches = Array.isArray(content.niches?.item) ? content.niches.item : (content.niches?.item ? [content.niches.item] : []);

  return (
    <main>
      <header className="nav">
        <a className="brand" href="#top">YULIANA<span>.</span></a>
        <nav>
          <a href="#work">Работы</a>
          <a href="#about">Обо мне</a>
          <a className="nav-cta" href="#contact">Сотрудничество</a>
        </nav>
      </header>

      <HeroExperience
        title={first(hero.title, "Контент, которому верят.")}
        text={text(hero.text, "Создаю живые видео для брендов — от распаковок и обзоров до нативных lifestyle-сюжетов.")}
        button={first(hero.button, "Смотреть работы")}
        image={heroImage}
      />

      <section className="work" id="work">
        <div className="section-number">01</div>
        <div className="section-head">
          <div>
            <p className="eyebrow">SELECTED WORK</p>
            <h2>Последние работы</h2>
          </div>
        </div>

        {projects.length > 0 ? (
          <div className="grid">
            {projects.map((project, index) => (
              <article className={`card card-${(index % 3) + 1}`} key={project.id}>
                <div className="card-mark" aria-hidden="true"><span>{String(index + 1).padStart(2, "0")}</span><i /></div>
                <VideoEmbed platform={project.platform} url={project.video} />
                <div className="card-info">
                  {project.platform && <span>{project.platform}</span>}
                  <h3>{project.title || "UGC project"}</h3>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-state">Добавьте работы с видео в базу Notion.</p>
        )}
      </section>

      <section className="about" id="about">
        <div className="section-number">02</div>
        <div>
          <p className="eyebrow">ABOUT</p>
          <h2>{first(about.title, "Живой контент вместо постановки.")}</h2>
          <p>
            {text(about.text, "Я создаю UGC, который естественно выглядит в ленте и помогает зрителю представить продукт в реальной жизни.")}
          </p>
          {aboutImage && (
            <img className="about-image" src={aboutImage} alt="" />
          )}
        </div>
      </section>

      <section className="service-section" id="formats">
        <div className="section-number">03</div>
        <div className="service-content">
          <p className="eyebrow">FORMATS</p>
          <h2>Форматы работы</h2>
          {formats.length > 0 && <div className="service-list">{formats.map((item, index) => <div className="service-item" key={index}><ServiceIcon index={index} /><span>{item}</span><b>↗</b></div>)}</div>}
        </div>
      </section>

      <section className="service-section" id="niches">
        <div className="section-number">04</div>
        <div className="service-content">
          <p className="eyebrow">CATEGORIES</p>
          <h2>Направления ниш товаров</h2>
          {niches.length > 0 && <div className="service-list">{niches.map((item, index) => <div className="service-item" key={index}>{item}</div>)}</div>}
        </div>
      </section>

      <section className="contact" id="contact">
        <div className="section-number">05</div>
        <p className="eyebrow">LET'S WORK TOGETHER</p>
        <h2>{first(contact.title, "Есть продукт? Давайте снимем.")}</h2>
        <div className="contact-links">
          <a className="contact-link" href={`mailto:${contactEmail}`}>{contactEmail} ↗</a>
          {contactTelegram && <a className="contact-link" href={contactTelegram} target="_blank" rel="noreferrer">Telegram ↗</a>}
          {contactInstagram && <a className="contact-link" href={contactInstagram} target="_blank" rel="noreferrer">Instagram ↗</a>}
        </div>
      </section>

      <footer>
        <span>{first(footer.text, "YULIANA © 2026")}</span>
        <span>{Array.isArray(footer.text) ? footer.text[1] : "UGC · CONTENT · REVIEWS"}</span>
      </footer>
    </main>
  );
}
