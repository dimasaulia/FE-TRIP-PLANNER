import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { loginWithNext, routes } from "@/config/routes.config";
import { SessionProvider } from "@/modules/auth/SessionProvider";
import { getServerSession } from "@/modules/auth/services/session.server";

/** Protected surface: validates the session on the server before rendering. */
export async function AppLayout({ children }: { children: React.ReactNode }) {
  const me = await getServerSession();
  if (!me) {
    const next = (await headers()).get("x-next-path") ?? routes.trips;
    redirect(loginWithNext(next));
  }

  return (
    <SessionProvider me={me}>
      <div className="min-h-screen bg-page text-ink">{children}</div>
    </SessionProvider>
  );
}
