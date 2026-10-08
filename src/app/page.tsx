import { redirect } from "next/navigation";
import { routes } from "@/config/routes.config";

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  // The backend sends OAuth failures to "/?login_error=…".
  if (params.login_error) redirect(`${routes.login}?error=${encodeURIComponent(params.login_error)}`);
  redirect(routes.trips);
}
