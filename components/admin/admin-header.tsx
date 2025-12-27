"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

interface AdminHeaderProps {
  email: string;
}

export function AdminHeader({ email }: AdminHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/95 px-4 backdrop-blur-sm lg:px-6">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-white lg:hidden"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Logo */}
      <Link href="/admin" className="flex items-center gap-2 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-primary)]">
          <svg
            className="h-4 w-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="text-lg font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
          Admin
        </span>
      </Link>

      {/* Desktop Title */}
      <div className="hidden lg:block">
        <h1 className="text-lg font-semibold text-white">Panel Administracyjny</h1>
      </div>

      {/* User Menu */}
      <div className="flex items-center gap-4">
        <span className="hidden text-sm text-[var(--text-secondary)] sm:block">{email}</span>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-2 rounded-lg bg-[var(--bg-hover)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--accent-primary)] hover:text-white disabled:opacity-50"
        >
          {isLoggingOut ? (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          )}
          <span className="hidden sm:inline">Wyloguj</span>
        </button>
      </div>

      {/* Mobile Slide-out Menu */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 z-50 h-full w-64 border-r border-[var(--border-color)] bg-[var(--bg-secondary)] lg:hidden">
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex h-16 items-center justify-between border-b border-[var(--border-color)] px-4">
                <span className="text-lg font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
                  Menu
                </span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-white"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-1 p-4">
                <MobileNavLink href="/admin" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </MobileNavLink>
                <MobileNavLink href="/admin/druzyny" onClick={() => setIsMenuOpen(false)}>
                  Druzyny
                </MobileNavLink>
                <MobileNavLink href="/admin/mecze" onClick={() => setIsMenuOpen(false)}>
                  Mecze
                </MobileNavLink>
                <MobileNavLink href="/admin/wyniki" onClick={() => setIsMenuOpen(false)}>
                  Wyniki
                </MobileNavLink>
                <MobileNavLink href="/admin/ustawienia" onClick={() => setIsMenuOpen(false)}>
                  Ustawienia
                </MobileNavLink>
              </nav>

              {/* Back to Site */}
              <div className="border-t border-[var(--border-color)] p-4">
                <Link
                  href="/"
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Powrot do strony
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block rounded-lg px-4 py-3 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-white"
    >
      {children}
    </Link>
  );
}
