import { Suspense } from "react";
import { pageMetadata } from "@/features/seo/metadata";
import { LoginV1 } from "@/features/auth/pages/LoginV1";

export const metadata = pageMetadata("meta.login.title");

export default function LoginPage() {
  return (
    <Suspense>
      <LoginV1 />
    </Suspense>
  );
}
