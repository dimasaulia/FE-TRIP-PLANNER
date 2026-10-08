import { appConfig } from "@/config/app.config";
import { brand, brandHues } from "@/styles/brand";

// Rendered by next/og (Satori): inline styles, flex layout only.

type Note = { hue: number; tag: string; title: string; rotate: number; offset: number };

type BrandImageProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  notes: Note[];
};

export const OG_SIZE = { width: 1200, height: 630 };

export function BrandMark({ size }: { size: number }) {
  const unit = size / 64;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 15 * unit,
        background: `linear-gradient(135deg, ${brand.accent}, ${brand.accentDeep})`,
        display: "flex",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 21 * unit,
          top: 17 * unit,
          width: 34 * unit,
          height: 32 * unit,
          borderRadius: 7 * unit,
          background: brand.noteGradient(brandHues.sun),
          transform: "rotate(-7deg)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 5 * unit,
          paddingLeft: 6.5 * unit,
        }}
      >
        <div style={{ width: 17 * unit, height: 3.2 * unit, borderRadius: 2 * unit, background: brand.ink }} />
        <div style={{ width: 11 * unit, height: 3.2 * unit, borderRadius: 2 * unit, background: brand.ink }} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 35.8 * unit,
          top: 11.8 * unit,
          width: 8.4 * unit,
          height: 8.4 * unit,
          borderRadius: 999,
          background: brand.note(brandHues.coral),
          border: `${1.6 * unit}px solid ${brand.onAccent}`,
        }}
      />
    </div>
  );
}

export function BrandImage({ eyebrow, title, subtitle, notes }: BrandImageProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: brand.page,
        padding: 72,
        fontFamily: "sans-serif",
        color: brand.ink,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 600 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <BrandMark size={64} />
          <div style={{ fontSize: 30, fontWeight: 700 }}>{appConfig.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 22, letterSpacing: 4, textTransform: "uppercase", color: brand.accent }}>{eyebrow}</div>
          <div style={{ fontSize: title.length > 34 ? 54 : 66, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1.5 }}>{title}</div>
          <div style={{ fontSize: 28, lineHeight: 1.4, color: brand.inkMuted }}>{subtitle}</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 26, flex: 1, paddingLeft: 48 }}>
        {notes.map((note) => (
          <div
            key={note.tag}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              padding: "22px 28px",
              borderRadius: 22,
              background: brand.noteGradient(note.hue),
              boxShadow: brand.shadow,
              borderTop: `2px solid ${brand.highlight}`,
              transform: `rotate(${note.rotate}deg) translateX(${note.offset}px)`,
            }}
          >
            <div style={{ fontSize: 18, letterSpacing: 2, textTransform: "uppercase", opacity: 0.7 }}>{note.tag}</div>
            <div style={{ fontSize: 30, fontWeight: 700 }}>{note.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
