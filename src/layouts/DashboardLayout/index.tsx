"use client";

import Link from "next/link";
import { appConfig } from "@/config/app.config";
import { useAuthorizedMenu } from "@/modules/auth/hooks/useAuthorizedMenu";
import { usePreferences, type Language } from "@/modules/preferences";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const menu = useAuthorizedMenu();
  const { language, setLanguage, t } = usePreferences();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-line bg-panel px-5 py-5 lg:border-b-0 lg:border-r">
          <div className="text-lg font-semibold">{appConfig.name}</div>
          <nav className="mt-8 flex gap-2 lg:flex-col">
            {menu.map((item) => (
              <Link
                className="rounded-md px-3 py-2 text-sm font-medium text-muted transition hover:bg-background hover:text-foreground"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <section>
          <header className="flex items-center justify-between border-b border-line bg-panel px-6 py-4">
            <div>
              <p className="text-sm font-medium text-muted">
                {t("layout.workspace")}
              </p>
              <h1 className="text-xl font-semibold">{t("layout.title")}</h1>
            </div>
            <div className="flex items-center gap-3">
              <LanguageToggle language={language} setLanguage={setLanguage} />
              <Link
                className="rounded-md border border-line px-3 py-2 text-sm font-semibold"
                href="/login"
              >
                {t("layout.login")}
              </Link>
            </div>
          </header>
          <div className="px-6 py-6">{children}</div>
        </section>
      </div>
    </main>
  );
}

type LanguageToggleProps = {
  language: Language;
  setLanguage: (language: Language) => void;
};

function LanguageToggle({ language, setLanguage }: LanguageToggleProps) {
  const languages: Language[] = ["en", "id"];

  return (
    <div className="flex items-center rounded-md border border-line p-0.5 text-sm font-semibold">
      {languages.map((option) => (
        <button
          className={`rounded px-2 py-1 uppercase transition ${
            option === language
              ? "bg-accent text-accent-foreground"
              : "text-muted hover:text-foreground"
          }`}
          key={option}
          onClick={() => setLanguage(option)}
          type="button"
        >
          {option}
        </button>
      ))}
    </div>
  );
}
