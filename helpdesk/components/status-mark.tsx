import { cn } from "@/lib/utils";

const STATUS = {
  Open: { label: "Open", dot: "bg-chart-2" },
  InProgress: { label: "In progress", dot: "border-2 border-chart-2" },
  Closed: { label: "Closed", dot: "bg-muted-foreground/60" },
} as const;

export function StatusMark({ status }: { status: string }) {
  const item = STATUS[status as keyof typeof STATUS] ?? {
    label: status,
    dot: "bg-muted-foreground/60",
  };

  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", item.dot)} />
      {item.label}
    </span>
  );
}

const LEVEL = { Low: 1, Medium: 2, High: 3 } as const;

export function PriorityMark({ priority }: { priority: string }) {
  const level = LEVEL[priority as keyof typeof LEVEL] ?? 0;

  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <span className="inline-flex items-end gap-0.5" aria-hidden>
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "w-1 rounded-sm",
              i === 1 ? "h-2" : i === 2 ? "h-3" : "h-4",
              i <= level
                ? priority === "High"
                  ? "bg-destructive"
                  : "bg-chart-2"
                : "bg-muted-foreground/25"
            )}
          />
        ))}
      </span>
      {priority}
    </span>
  );
}