import { Button } from "@/shared/components/Button";
import { LoginFormSection } from "./sections/LoginFormSection";

export function LoginV1() {
  return (
    <div className="w-full rounded-lg border border-line bg-panel p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-accent">LoginV1</p>
        <h2 className="mt-2 text-2xl font-semibold">Sign in to workspace</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          This page demonstrates versioned routing while real authentication can
          be connected to Auth.js or Keycloak later.
        </p>
      </div>
      <LoginFormSection />
      <div className="mt-5">
        <Button href="/dashboard" variant="secondary">
          Continue as demo user
        </Button>
      </div>
    </div>
  );
}
