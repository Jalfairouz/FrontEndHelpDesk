export function getStatusClass(status: string): string {
  switch (status) {
    case "Open":
      // solid green: needs attention
      return "bg-primary text-primary-foreground hover:bg-primary";
    case "InProgress":
      // green outline: in motion
      return "border-primary/50 bg-primary/10 text-primary hover:bg-primary/10 dark:text-chart-2";
    default:
      // closed: quiet gray
      return "bg-muted text-muted-foreground hover:bg-muted";
  }
}

export function getPriorityClass(priority: string): string {
  switch (priority) {
    case "High":
      // solid red
      return "border-transparent bg-destructive text-white";
    case "Medium":
      return "border-border bg-secondary text-secondary-foreground";
    case "Low":
      return "border-border bg-transparent text-muted-foreground";
    default:
      return "";
  }
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}
export function shortId(id: string | null | undefined): string {
  return id ? id.slice(0, 8) : "-";
}
export function formatDateShort(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getPriorityStripe(priority: string): string {
  switch (priority) {
    case "High":
      return "border-l-destructive";
    case "Medium":
      return "border-l-primary";
    default:
      return "border-l-muted-foreground/40";
  }
}