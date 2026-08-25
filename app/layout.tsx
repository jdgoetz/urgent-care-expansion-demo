import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Urgent Care Expansion Intelligence Demo",
  description: "Curated real-market healthcare expansion intelligence demonstration with simplified public scoring.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="app-header">
          <a className="brand" href="/map">
            <span className="brand-mark">UC</span>
            <span>
              <strong>Expansion Intelligence</strong>
              <small>Public technical demo</small>
            </span>
          </a>
          <span className="demo-badge">Real public markets · Demo scores</span>
        </header>
        {children}
      </body>
    </html>
  );
}
