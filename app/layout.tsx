import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "给你的夏日来信",
    template: "%s · 给你的夏日来信",
  },
  description: "一座会发光、会互动、只认真收藏你的夏日照片宇宙。",
  applicationName: "给你的夏日来信",
  openGraph: {
    title: "给你的夏日来信",
    description: "照片、小小真人版的你、鼠标星光和一封完整展开的信。",
    type: "website",
    locale: "zh_CN",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
