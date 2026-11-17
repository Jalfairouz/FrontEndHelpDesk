"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { getSystemTickets } from "@/lib/api";
import { useRequireRole } from "@/hooks/use-require-role";
import { FilterTabs } from "@/components/filter-tabs";
import { TicketPanel } from "@/components/ticket-panel";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { StatusFilter, Ticket } from "@/types";

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "", label: "All" },
  { value: "Open", label: "Open" },
  { value: "InProgress", label: "In progress" },
  { value: "Closed", label: "Closed" },
];

export default function AdminTicketsPage() {
  const { ready } = useRequireRole(["Admin"]);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [status, setStatus] = useState<StatusFilter>("");
  const [unassigned, setUnassigned] = useState(false);
  const [query, setQuery] = useState("");

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

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tickets;

    return tickets.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }, [tickets, query]);

  if (!ready) {
    return <div className="p-6 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">System tickets</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {loading
            ? "Loading tickets..."
            : `${visible.length} ticket${visible.length === 1 ? "" : "s"}`}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div className="flex flex-wrap items-center gap-3">
          <FilterTabs
            label="Status"
            value={status}
            onChange={setStatus}
            tabs={STATUS_TABS}
          />

          <button
            type="button"
            aria-pressed={unassigned}
            onClick={() => setUnassigned((v) => !v)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm transition-colors",
              unassigned
                ? "border-primary bg-primary/10 text-foreground"
                : "border-input text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            Unassigned only
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search title or category"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <Skeleton className="h-80 w-full rounded-lg" />
      ) : visible.length === 0 ? (
        <div className="rounded-lg border border-dashed py-14 text-center text-sm text-muted-foreground">
          No tickets match these filters.
        </div>
      ) : (
        <TicketPanel
          variant="light"
          title="Tickets"
          tickets={visible}
          canAssign
        />
      )}
    </div>
  );
}