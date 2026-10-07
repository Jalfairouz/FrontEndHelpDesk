export function getStatusClass(status: string): string {
  switch (status) {
    case "Open":
      return "bg-green-100 text-green-700 hover:bg-green-100";
    case "InProgress":
      return "bg-blue-100 text-blue-700 hover:bg-blue-100";
    default:
      return "bg-gray-100 text-gray-700 hover:bg-gray-100";
  }
}

export function getPriorityClass(priority: string): string {
  switch (priority) {
    case "High":
      return "border-red-300 text-red-600";
    case "Medium":
      return "border-yellow-300 text-yellow-600";
    case "Low":
      return "border-green-300 text-green-600";
    default:
      return "";
  }
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}