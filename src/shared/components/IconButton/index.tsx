import { forwardRef, type ButtonHTMLAttributes } from "react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { label: string };

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, className = "", children, type = "button", ...rest },
  ref,
) {
  return (
    <button
      aria-label={label}
      className={`inline-flex size-8 items-center justify-center rounded-pill text-ink-muted transition-colors hover:bg-sunken hover:text-ink disabled:opacity-40 ${className}`}
      ref={ref}
      title={label}
      type={type}
      {...rest}
    >
      {children}
    </button>
  );
});
