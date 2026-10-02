export function ProgressBar({
  label,
  value,
  target,
  unit,
  color,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: "you" | "partner";
}) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0;
  const over = value > target;
  const remaining = Math.max(0, target - value);

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="tabular-nums">
          <span className="font-semibold">{Math.round(value)}</span>
          <span className="text-muted"> / {target} {unit}</span>
        </span>
      </div>
      <div
        className="h-3 overflow-hidden rounded-full bg-surface-2"
        role="progressbar"
        aria-label={label}
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={target}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${color === "you" ? "bg-you" : "bg-partner"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={`mt-1 text-xs ${over ? "text-danger" : "text-muted"}`}>
        {over ? `${Math.round(value - target)} ${unit} over` : `${Math.round(remaining)} ${unit} to go`}
      </p>
    </div>
  );
}
