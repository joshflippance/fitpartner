import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  return (
    <button
      {...props}
      className={cx(
        "h-12 rounded-2xl px-5 font-medium transition active:scale-[0.98] disabled:opacity-50",
        variant === "primary" && "bg-you text-black",
        variant === "ghost" && "border border-line bg-surface text-text",
        variant === "danger" && "border border-danger/40 bg-transparent text-danger",
        className,
      )}
    />
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        "h-12 w-full rounded-2xl border border-line bg-surface px-4 text-base text-text outline-none placeholder:text-muted/60 focus:border-you",
        className,
      )}
    />
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted">{label}</span>
      {children}
    </label>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cx("rounded-3xl border border-line bg-surface p-5", className)}>{children}</section>;
}
