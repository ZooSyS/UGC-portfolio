import "./globals.css";

export const metadata = {
  title: "Yuliana — UGC Creator",
  description: "UGC portfolio",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
