import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { LanguageProvider } from "@/components/LanguageProvider";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "Job Tracker",
  description: "Track your job applications",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={geist.variable} suppressHydrationWarning>
      <head>
        {/* Apply dark class before paint to avoid flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            const t = localStorage.getItem('theme');
            const dark = t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches);
            document.documentElement.classList.toggle('dark', dark);
          } catch {}
        `}} />
      </head>
      <body className="h-full bg-zinc-50 font-[family-name:var(--font-geist)] text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
        <LanguageProvider><ToastProvider>{children}</ToastProvider></LanguageProvider>
      </body>
    </html>
  );
}
