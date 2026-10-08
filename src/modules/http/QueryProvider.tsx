"use client";

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { TranslationKey } from "@/modules/preferences";
import { loginWithNext } from "@/config/routes.config";
import { usePreferences } from "@/modules/preferences";
import { toast } from "@/shared/components/Toast";
import { ApiError } from "./api-error";
import { errorMessageKey } from "./error-message";

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      /** The caller shows its own feedback for 400/409/422 (editor, timeline). */
      handlesErrors?: boolean;
    };
    queryMeta: {
      /** Public pages: a 401 means "not signed in", not "session expired". */
      allowAnonymous?: boolean;
    };
  }
}

function redirectToLogin() {
  if (typeof window === "undefined") return;
  const next = window.location.pathname + window.location.search;
  window.location.assign(loginWithNext(next));
}

// Cache handlers live outside React; they read the current language from here.
const translator: { t: (key: TranslationKey) => string } = { t: (key) => key };

function createQueryClient() {
    const notify = (error: unknown) => {
      const message = translator.t(errorMessageKey(error));
      const retryAfter = error instanceof ApiError && error.retryAfter ? ` (${error.retryAfter}s)` : "";
      toast({ message: message + retryAfter, tone: "error" });
    };

    return new QueryClient({
      queryCache: new QueryCache({
        onError: (error, query) => {
          if (error instanceof ApiError && error.status === 401) {
            if (!query.meta?.allowAnonymous) redirectToLogin();
          }
          else if (error instanceof ApiError && (error.status === 403 || error.status === 429)) notify(error);
        },
      }),
      mutationCache: new MutationCache({
        onError: (error, _variables, _context, mutation) => {
          if (error instanceof ApiError && error.status === 401) {
            redirectToLogin();
            return;
          }
          const featureHandled =
            mutation.meta?.handlesErrors &&
            error instanceof ApiError &&
            [400, 409, 422].includes(error.status);
          if (!featureHandled) notify(error);
        },
      }),
      defaultOptions: {
        queries: {
          staleTime: 30_000,
          refetchOnWindowFocus: false,
          retry: (count, error) => !(error instanceof ApiError && error.status >= 400 && error.status < 500) && count < 1,
        },
      },
    });
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const { t } = usePreferences();
  const [client] = useState(createQueryClient);

  useEffect(() => {
    translator.t = t;
  }, [t]);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
