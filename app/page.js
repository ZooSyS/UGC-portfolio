import VideoEmbed from "../components/VideoEmbed";

async function getProjects() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const response = await fetch(`${baseUrl}/api/notion`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    console.error("Notion API error:", await response.text());
    return [];
  }

  const data = await response.json();

  return (data.results || [])
    .map((page) => {
      const properties = page.properties || {};

      const read = (names) => {
        for (const name of names) {
          const property = properties[name];
          if (!property) continue;

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
        }

        return "";
      };

      return {
        id: page.id,
        title: read(["Name", "Название", "Title", "Проект"]),
        category: read(["Category", "Категория", "Type", "Тип"]),
        description: read(["Description", "Описание", "Text", "Текст"]),
        video: read(["Video", "Видео", "URL", "Url", "Link", "Ссылка"]),
      };
    })
    .filter((project) => project.video);
}

export default async function Home() {
  const projects = await getProjects();

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
          <h1>Контент,<br /><em>которому</em> верят.</h1>
          <p className="hero-text">
            Создаю живые видео для брендов — от распаковок и обзоров
            до нативных lifestyle-сюжетов.
          </p>
          <a className="button" href="#work">Смотреть работы <span>↓</span></a>
        </div>
        <div className="hero-note">
          <span>01</span>
          <p>Не просто показать продукт.<br />Показать его в жизни.</p>
        </div>
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
                  {project.category && <span>{project.category}</span>}
                  <h3>{project.title || "UGC project"}</h3>
                  {project.description && <p>{project.description}</p>}
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
          <h2>Живой контент<br />вместо постановки.</h2>
          <p>
            Я создаю UGC, который естественно выглядит в ленте и помогает
            зрителю представить продукт в реальной жизни.
          </p>
        </div>
      </section>

      <section className="contact" id="contact">
        <p className="eyebrow">LET'S WORK TOGETHER</p>
        <h2>Есть продукт?<br /><em>Давайте снимем.</em></h2>
        <a className="contact-link" href="mailto:hello@example.com">hello@example.com ↗</a>
      </section>

      <footer>
        <span>YULIANA © 2026</span>
        <span>UGC · CONTENT · REVIEWS</span>
      </footer>
    </main>
  );
}
