import { cn } from "@/shared/utils/cn";
import { hueForId, noteStyle } from "@/shared/utils/hue";

type AvatarProps = {
  id: string;
  name: string;
  avatarUrl?: string | null;
  size?: number;
  online?: boolean;
  className?: string;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Avatar({ id, name, avatarUrl, size = 28, online, className }: AvatarProps) {
  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
      title={name}
    >
      {avatarUrl ? (
        // External Google avatars: plain img, no optimizer needed.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={name}
          className="size-full rounded-pill object-cover ring-2 ring-surface"
          referrerPolicy="no-referrer"
          src={avatarUrl}
        />
      ) : (
        <span
          className="note-chip inline-flex size-full items-center justify-center rounded-pill text-[0.62em] font-semibold ring-2 ring-surface"
          style={{ ...noteStyle(hueForId(id)), fontSize: Math.max(10, size * 0.38) }}
        >
          {initials(name)}
        </span>
      )}
      {online ? (
        <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-pill bg-online ring-2 ring-surface" />
      ) : null}
    </span>
  );
}

type AvatarStackProps = {
  people: Array<{ id: string; name: string; avatarUrl?: string | null; online?: boolean }>;
  size?: number;
  max?: number;
};

export function AvatarStack({ people, size = 28, max = 5 }: AvatarStackProps) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <span className="flex items-center">
      {shown.map((person, index) => (
        <Avatar
          avatarUrl={person.avatarUrl}
          className={index === 0 ? "" : "-ml-2"}
          id={person.id}
          key={person.id}
          name={person.name}
          online={person.online}
          size={size}
        />
      ))}
      {rest > 0 ? (
        <span
          className="-ml-2 inline-flex items-center justify-center rounded-pill bg-sunken-strong text-xs font-semibold ring-2 ring-surface"
          style={{ width: size, height: size }}
        >
          +{rest}
        </span>
      ) : null}
    </span>
  );
}
