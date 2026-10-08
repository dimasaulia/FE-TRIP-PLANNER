import type { Metadata } from "next";
import { JoinV1 } from "@/features/invites/pages/JoinV1";
import { joinMetadata } from "@/features/seo/metadata";

type JoinPageProps = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: JoinPageProps): Promise<Metadata> {
  const { token } = await params;
  return joinMetadata(token);
}

export default async function JoinPage({ params }: JoinPageProps) {
  const { token } = await params;
  return <JoinV1 token={token} />;
}
