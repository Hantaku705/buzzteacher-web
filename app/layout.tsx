import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BuzzTeacher - バズ動画分析AI",
  description: "動画URLを入力するとバズのプロがアドバイスします",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
