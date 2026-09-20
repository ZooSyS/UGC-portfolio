const projects = [
  {
    category: "Beauty",
    title: "Product integration",
    description: "Нативный UGC-контент с акцентом на продукт, детали и живую подачу.",
    telegram: "https://t.me/yuliana_m_portfolio/5/6",
  },
  {
    category: "Lifestyle",
    title: "Everyday story",
    description: "Короткий сюжет, который выглядит как обычный пользовательский контент, а не реклама.",
    telegram: "https://t.me/yuliana_m_portfolio/5/6",
  },
  {
    category: "Reviews",
    title: "Honest review",
    description: "Распаковка, демонстрация и личное впечатление в одном ролике.",
    telegram: "https://t.me/yuliana_m_portfolio/5/6",
  },
];

function TelegramEmbed({ url }) {
  const match = url.match(/t\.me\/(?:[^/]+)\/(\d+)\/(\d+)/);
  if (!match) return null;

  const postId = `${match[1]}/${match[2]}`;

  return (
    <div className="telegram-frame">
      <iframe
        src={`https://t.me/yuliana_m_portfolio/${postId}?embed=1`}
        title="UGC video"
        loading="lazy"
        allow="autoplay; encrypted-media; picture-in-picture"
      />
    </div>
  );
}

export default function Home() {
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
          <p className="section-note">Видео открываются прямо здесь</p>
        </div>

        <div className="grid">
          {projects.map((project, index) => (
            <article className={`card card-${index + 1}`} key={project.title}>
              <TelegramEmbed url={project.telegram} />
              <div className="card-info">
                <span>{project.category}</span>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </div>
            </article>
          ))}
        </div>
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
