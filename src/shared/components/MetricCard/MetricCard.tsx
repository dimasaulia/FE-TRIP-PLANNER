type MetricCardProps = {
  label: string;
  value: string;
  description: string;
};

export function MetricCard({ label, value, description }: MetricCardProps) {
  return (
    <article className="rounded-lg border border-line bg-panel p-5">
      <p className="text-sm font-medium text-muted">{label}</p>
      <strong className="mt-3 block text-3xl font-semibold text-foreground">
        {value}
      </strong>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
    </article>
  );
}
