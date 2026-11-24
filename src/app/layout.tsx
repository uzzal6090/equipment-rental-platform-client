import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/nav/navbar";

export const metadata: Metadata = {
  title: "Equipment Rental Platform",
  description: "Premium equipment rental marketplace",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="min-h-full antialiased dark" style={{ colorScheme: "dark" }}>
      <head>
        <script
          id="next-themes-init"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                try {
                  const theme = localStorage.getItem('equipment-rental-theme') ?? 'dark';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col pt-16">
        <Providers>
          <Suspense fallback={<div className="h-16" />}>
            <Navbar />
          </Suspense>
          {children}
        </Providers>
      </body>
    </html>
  );
}
