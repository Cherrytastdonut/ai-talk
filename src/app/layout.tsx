import type { Metadata } from "next";
import "./globals.css";
import "../styles/mascot.css";

export const metadata: Metadata = {
  title: "몽글이 마음 친구",
  description: "일상의 감정을 들어주는 AI 정서 친구"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
