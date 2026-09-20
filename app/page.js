export const dynamic = "force-dynamic";

import VideoEmbed from "../components/VideoEmbed";

async function getSiteData() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const response = await fetch(`${baseUrl}/api/notion`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    console.error("Notion API error:", await response.text());
    return { projects: [], content: {} };
  }

  return response.json();
}

function first(value, fallback = "") {
  if (Array.isArray(value)) return value[0] || fallback;
  return value || fallback;
}

function text(value, fallback = "") {
  if (Array.isArray(value)) return value.join("\n");
  return value || fallback;
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

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">UGC CREATOR · CONTENT · REVIEWS</p>
          <h1>{first(hero.title, "Контент, которому верят.")}</h1>
          <p className="hero-text">
            {text(hero.text, "Создаю живые видео для брендов — от распаковок и обзоров до нативных lifestyle-сюжетов.")}
          </p>
          <a className="button" href="#work">
            {first(hero.button, "Смотреть работы")} <span>↓</span>
          </a>
        </div>
        <div className="hero-note">
          <span>01</span>
          <p>Не просто показать продукт.<br />Показать его в жизни.</p>
        </div>
        {heroImage && (
          <img className="hero-image" src={heroImage} alt="" />
        )}
      </section>

      <section className="work" id="work">
        <div className="section-head">
          <div>
            <p className="eyebrow">SELECTED WORK</p>
            <h2>Последние работы</h2>
          </div>
          <p className="section-note">Видео берутся из Notion</p>
        </div>

        {projects.length > 0 ? (
          <div className="grid">
            {projects.map((project, index) => (
              <article className={`card card-${(index % 3) + 1}`} key={project.id}>
                <VideoEmbed url={project.video} />
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
        <div className="about-number">02</div>
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

      <section className="contact" id="contact">
        <p className="eyebrow">LET'S WORK TOGETHER</p>
        <h2>{first(contact.title, "Есть продукт? Давайте снимем.")}</h2>
        <a className="contact-link" href={`mailto:${contactEmail}`}>
          {contactEmail} ↗
        </a>
      </section>

      <footer>
        <span>{first(footer.text, "YULIANA © 2026")}</span>
        <span>{Array.isArray(footer.text) ? footer.text[1] : "UGC · CONTENT · REVIEWS"}</span>
      </footer>
    </main>
  );
}
