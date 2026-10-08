"use client";

import { QueryProvider } from "@/modules/http/QueryProvider";
import { PreferencesProvider } from "@/modules/preferences";
import { Toaster } from "@/shared/components/Toast";

export function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <PreferencesProvider>
      <QueryProvider>
        {children}
        <Toaster />
      </QueryProvider>
    </PreferencesProvider>
  );
}
