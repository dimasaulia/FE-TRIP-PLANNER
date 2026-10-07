import Link from "next/link";

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
};

const variants = {
  primary: "bg-accent text-accent-foreground hover:bg-[#1f5f54]",
  secondary: "border border-line bg-panel text-foreground hover:bg-[#f1eadf]",
};

export function Button({
  children,
  href,
  variant = "primary",
}: ButtonProps) {
  const className = `inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold transition ${variants[variant]}`;

  if (href) {
    return (
      <Link className={className} href={href}>
        {children}
      </Link>
    );
  }

  return <button className={className}>{children}</button>;
}
