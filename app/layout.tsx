import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Urgent Care Expansion Intelligence Demo",
  description: "Synthetic geospatial healthcare expansion intelligence demonstration.",
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
          <span className="demo-badge">Synthetic data</span>
        </header>
        {children}
      </body>
    </html>
  );
}

