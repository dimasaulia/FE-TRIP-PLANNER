"use client";

import { useQueryClient } from "@tanstack/react-query";
import { routes } from "@/config/routes.config";
import { useSession } from "@/modules/auth/hooks/useSession";
import { sessionService } from "@/modules/auth/services/session.service";
import { usePreferences, type Language, type ThemePreference } from "@/modules/preferences";
import { Avatar } from "@/shared/components/Avatar";
import { Popover } from "@/shared/components/Popover";
import { cn } from "@/shared/utils/cn";

function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: Array<[T, string]>; onChange: (value: T) => void; label: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-ink-muted">{label}</p>
      <div className="flex rounded-pill bg-sunken p-0.5 text-xs font-semibold">
        {options.map(([option, text]) => (
          <button
            aria-pressed={value === option}
            className={cn("flex-1 rounded-pill px-2 py-1", value === option ? "bg-surface shadow-sm" : "text-ink-muted")}
            key={option}
            onClick={() => onChange(option)}
            type="button"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Profile, language, theme and sign-out; used in the avatar popover and the mobile menu. */
export function AccountPanel() {
  const { t, language, setLanguage, theme, setTheme } = usePreferences();
  const { data } = useSession();
  const queryClient = useQueryClient();
  const user = data?.user;
  if (!user) return null;

  return (
    <div>
      <div className="flex items-center gap-3">
        <Avatar avatarUrl={user.avatar_url} id={user.id} name={user.name} size={36} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="truncate text-xs text-ink-muted">{user.email}</p>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <Segmented<Language>
          label={t("common.language")}
          onChange={setLanguage}
          options={[
            ["id", "ID"],
            ["en", "EN"],
          ]}
          value={language}
        />
        <Segmented<ThemePreference>
          label={t("user.theme")}
          onChange={setTheme}
          options={[
            ["light", t("user.theme.light")],
            ["dark", t("user.theme.dark")],
            ["system", t("user.theme.system")],
          ]}
          value={theme}
        />
      </div>
      <button
        className="mt-4 w-full rounded-pill border border-line-strong py-2 text-sm font-semibold hover:bg-sunken"
        onClick={async () => {
          try {
            await sessionService.logout();
          } finally {
            queryClient.clear();
            window.location.assign(routes.login);
          }
        }}
        type="button"
      >
        {t("user.logout")}
      </button>
    </div>
  );
}

export function UserMenu() {
  const { t } = usePreferences();
  const { data } = useSession();
  const user = data?.user;
  if (!user) return null;

  return (
    <Popover
      align="end"
      trigger={
        <button aria-label={t("user.menu")} className="rounded-pill" type="button">
          <Avatar avatarUrl={user.avatar_url} id={user.id} name={user.name} size={32} />
        </button>
      }
      width={260}
    >
      <AccountPanel />
    </Popover>
  );
}
