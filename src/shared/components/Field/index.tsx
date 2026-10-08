import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

export const inputClassName =
  "h-10 w-full rounded-input border border-line-strong bg-surface px-3 text-sm outline-none transition-colors placeholder:text-ink-muted focus:border-accent";

type LabelProps = { label: string; hint?: string; error?: string; children: React.ReactNode; className?: string };

export function Field({ label, hint, error, children, className }: LabelProps) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-danger">{error}</span> : null}
      {!error && hint ? <span className="mt-1 block text-xs text-ink-muted">{hint}</span> : null}
    </label>
  );
}

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function TextInput(
  { className, ...rest },
  ref,
) {
  return <input className={cn(inputClassName, className)} ref={ref} {...rest} />;
});

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function TextArea(
  { className, ...rest },
  ref,
) {
  return <textarea className={cn(inputClassName, "h-auto min-h-20 py-2", className)} ref={ref} {...rest} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, ...rest },
  ref,
) {
  return <select className={cn(inputClassName, "pr-8", className)} ref={ref} {...rest} />;
});
