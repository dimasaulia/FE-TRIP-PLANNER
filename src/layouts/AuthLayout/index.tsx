import { appConfig } from "@/config/app.config";

type AuthLayoutProps = {
  children: React.ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 px-5 py-6 lg:grid-cols-[1fr_420px] lg:gap-12">
        <section className="flex flex-col justify-between py-6">
          <div className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">
            {appConfig.name}
          </div>
          <div className="max-w-xl py-16">
            <p className="text-sm font-semibold text-warning">OpenSuite FE</p>
            <h1 className="mt-4 text-5xl font-semibold leading-tight text-foreground">
              Clean foundation for enterprise apps.
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted">
              Route mapping, versioned pages, SDK-ready authorization, and
              feature-first boundaries are prepared from day one.
            </p>
          </div>
        </section>
        <section className="flex items-center">{children}</section>
      </div>
    </main>
  );
}
