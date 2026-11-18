import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  formatDateShort,
  getPriorityClass,
  getStatusClass,
  displayName,
} from "@/lib/ticket-ui";
import type { Ticket } from "@/types";

interface Props {
  ticket: Ticket;
  canAssign?: boolean;
}

export function TicketListItem({ ticket, canAssign = false }: Props) {
  return (
    <div className="rounded-xl border bg-card px-5 py-4 transition-colors hover:border-primary/40 hover:bg-accent/40">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-3">
        {/* Row 1: title */}
        <Link
          href={`/tickets/${ticket.id}`}
            className="block min-w-0 truncate font-medium hover:text-primary"        >
          <bdi>{ticket.title}</bdi>
        </Link>

        {/* Actions: span both rows */}
        <div className="row-span-2 flex items-center gap-2 self-center">
          {canAssign && !ticket.assignedTechnicianId && (
            <Link
              href={`/tickets/${ticket.id}/assign`}
              className={buttonVariants({ size: "sm" })}
            >
              Assign
            </Link>
          )}

          <Link
            href={`/tickets/${ticket.id}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            View
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Row 2: badges + info */}
        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Badge className={getStatusClass(ticket.status)}>
              {ticket.status}
            </Badge>
            <Badge
              variant="outline"
              className={getPriorityClass(ticket.priority)}
            >
              {ticket.priority}
            </Badge>
          </div>

          <span>{ticket.category}</span>

          <span>
            {ticket.assignedTechnicianId ? (
              <span title={ticket.assignedTechnicianId}>
                {displayName(ticket.assignedTechnicianName, ticket.assignedTechnicianId)}
              </span>
            ) : (
              <span className="font-medium text-destructive">Unassigned</span>
            )}
          </span>

          <span className="tabular-nums">
            {formatDateShort(ticket.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}