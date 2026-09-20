import VideoEmbed from "./components/VideoEmbed";

async function getVideos() {
  const response = await fetch(
    "https://ugc-portfolio-opal.vercel.app/api/notion",
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Не удалось получить данные из Notion");
  }

  return response.json();
}

export default async function Home() {
  const data = await getVideos();

  const videos = data.results.map((item) => {
    const properties = item.properties;

    return {
      id: item.id,
      title:
        properties["Название"]?.title?.[0]?.plain_text || "Без названия",
      platform:
        properties["Платформа"]?.rich_text?.[0]?.plain_text || "Неизвестно",
      url: properties["Ссылка"]?.url || "",
    };
  });

  return (
    <main
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>UGC Portfolio</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "30px",
          marginTop: "40px",
        }}
      >
        {videos.map((video) => (
          <article key={video.id}>
            <h2>{video.title}</h2>

            <VideoEmbed
              platform={video.platform}
              url={video.url}
            />
          </article>
        ))}
      </div>
    </main>
  );
}