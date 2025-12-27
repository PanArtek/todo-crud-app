import type { Metadata } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Ekstraklasa Tracker",
    template: "%s | Ekstraklasa Tracker",
  },
  description:
    "Tabela ligowa, terminarz i wyniki polskiej Ekstraklasy. Inspirowane SofaScore.",
  keywords: ["Ekstraklasa", "piłka nożna", "tabela", "wyniki", "terminarz"],
};

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-primary)]">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              <path d="M2 12h20" />
            </svg>
          </div>
          <span
            className="text-xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            <span className="text-white">Ekstraklasa</span>
            <span className="text-[var(--accent-secondary)]"> Tracker</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink href="/">Tabela</NavLink>
          <NavLink href="/terminarz">Terminarz</NavLink>
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-white"
    >
      {children}
    </Link>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className={`${outfit.variable} ${dmSans.variable} antialiased`}>
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
