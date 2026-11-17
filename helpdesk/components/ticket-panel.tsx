import Link from "next/link";

import { PriorityMark, StatusMark } from "@/components/status-mark";
import { buttonVariants } from "@/components/ui/button";
import { formatDateShort } from "@/lib/ticket-ui";
import { cn } from "@/lib/utils";
import type { Ticket } from "@/types";

interface Props {
  title: string;
  tickets: Ticket[];
  canAssign?: boolean;
  action?: React.ReactNode;
  variant?: "dark" | "light";
}

export function TicketPanel({
  title,
  tickets,
  canAssign = false,
  action,
  variant = "dark",
}: Props) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg bg-card text-card-foreground",
        variant === "dark" ? "dark" : "border"
      )}
    >
      <div className="flex items-center justify-between border-b px-4 py-3">
        <span className="text-sm font-medium">{title}</span>
        {action}
      </div>

      <ul className="divide-y">
        {tickets.map((ticket) => (
          <li
            key={ticket.id}
            className="flex items-center transition-colors hover:bg-accent/40"
          >
            <Link
              href={`/tickets/${ticket.id}`}
              className="flex min-w-0 flex-1 items-center gap-4 px-4 py-3.5"
            >
              {/* Title + details */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  <bdi>{ticket.title}</bdi>
                </p>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <StatusMark status={ticket.status} />
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    {ticket.category}
                  </span>
                  <span className="hidden text-xs text-muted-foreground tabular-nums md:inline">
                    {formatDateShort(ticket.createdAt)}
                  </span>
                </div>
              </div>

              {/* Priority: fixed column so every row lines up */}
              <div className="w-24 shrink-0">
                <PriorityMark priority={ticket.priority} />
              </div>
            </Link>

            {canAssign && !ticket.assignedTechnicianId && (
              <Link
                href={`/tickets/${ticket.id}/assign`}
                className={cn(buttonVariants({ size: "sm" }), "mr-4 shrink-0")}
              >
                Assign
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}