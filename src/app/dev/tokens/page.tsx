import { notFound } from "next/navigation";
import { TokensV1 } from "@/features/dev-tools/pages/TokensV1";

export default function DevTokensPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <TokensV1 />;
}
