import "./globals.css";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display" });
const body = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-body" });

export const metadata = {
  title: "Tracer Study PKBM RUMAH HIJAU",
  description: "Survei alumni PKBM RUMAH HIJAU untuk menilai keselarasan pendidikan dan dunia kerja.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${display.variable} ${body.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
