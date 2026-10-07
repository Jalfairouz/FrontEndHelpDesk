import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatDate,
  getPriorityClass,
  getStatusClass,
} from "@/lib/ticket-ui";
import type { Ticket } from "@/types";

interface Props {
  ticket: Ticket;
  canAssign?: boolean;
}

export function TicketListItem({ ticket, canAssign = false }: Props) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{ticket.title}</span>

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

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>Category: {ticket.category}</span>
            <span>Created: {formatDate(ticket.createdAt)}</span>
          </div>

          <div className="text-sm">
            <span className="text-muted-foreground">Assigned to: </span>

            {ticket.assignedTechnicianId ? (
              <span className="font-medium">
                {ticket.assignedTechnicianId}
              </span>
            ) : (
              <span className="font-medium text-orange-600">Not assigned</span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm">
            <Link href={`/tickets/${ticket.id}`}>View</Link>
          </Button>

          {canAssign && !ticket.assignedTechnicianId && (
            <Button size="sm">
              <Link href={`/tickets/${ticket.id}/assign`}>Assign</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}