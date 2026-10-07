"use client";

import { useEffect, useState } from "react";

import { getAssignedTickets, getTickets } from "@/lib/api";
import { useRequireRole } from "@/hooks/use-require-role";
import { TicketListItem } from "@/components/ticket-list-item";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Ticket } from "@/types";

export default function TicketsPage() {
  const { ready, role } = useRequireRole();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready || !role) return;

    let cancelled = false;

    async function loadTickets() {
      setLoading(true);
      setError("");

      try {
        const data =
          role === "Technician" ? await getAssignedTickets() : await getTickets();

        if (!cancelled) setTickets(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load tickets");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTickets();

    return () => {
      cancelled = true;
    };
  }, [ready, role]);

  if (!ready) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {role === "Technician" ? "Assigned Tickets" : "My Tickets"}
          </CardTitle>

          <CardDescription>
            {loading
              ? "Loading tickets..."
              : `${tickets.length} ticket${tickets.length === 1 ? "" : "s"} found`}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="py-10 text-center text-muted-foreground">
              Loading tickets...
            </div>
          ) : tickets.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              No tickets found.
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <TicketListItem
                  key={ticket.id}
                  ticket={ticket}
                  canAssign={role === "Admin"}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}