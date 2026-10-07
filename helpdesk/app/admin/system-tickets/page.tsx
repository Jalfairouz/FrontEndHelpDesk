"use client";

import { useEffect, useState } from "react";
import { Filter, RotateCcw } from "lucide-react";

import { getSystemTickets } from "@/lib/api";
import { useRequireRole } from "@/hooks/use-require-role";
import { TicketListItem } from "@/components/ticket-list-item";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { StatusFilter, Ticket } from "@/types";

export default function AdminTicketsPage() {
  const { ready } = useRequireRole(["Admin"]);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [status, setStatus] = useState<StatusFilter>("");
  const [unassigned, setUnassigned] = useState(false);

  useEffect(() => {
    if (!ready) return;

    let cancelled = false;

    async function loadTickets() {
      setLoading(true);
      setError("");

      try {
        const data = await getSystemTickets({
          status: status || undefined,
          unassigned: unassigned ? true : undefined,
        });

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
  }, [ready, status, unassigned]);

  const resetFilters = () => {
    setStatus("");
    setUnassigned(false);
  };

  if (!ready) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Tickets</h1>
        <p className="mt-2 text-muted-foreground">
          Manage and assign support tickets
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <div>
              <CardTitle>Filters</CardTitle>
              <CardDescription>
                Filter tickets by status and assignment
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex flex-col gap-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>

              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusFilter)}
                className="h-10 rounded-md border bg-background px-3 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="Open">Open</option>
                <option value="InProgress">In Progress</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <label className="flex h-10 items-center gap-2 rounded-md border px-3 text-sm">
              <input
                type="checkbox"
                checked={unassigned}
                onChange={(e) => setUnassigned(e.target.checked)}
                className="h-4 w-4"
              />
              Unassigned
            </label>

            <Button type="button" variant="outline" onClick={resetFilters}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
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
                <TicketListItem key={ticket.id} ticket={ticket} canAssign />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}