export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-block animate-spin rounded-pill border-2 border-line-strong border-t-accent"
      style={{ width: size, height: size }}
    />
  );
}
