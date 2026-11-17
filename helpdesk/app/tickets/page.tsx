"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";

import { getAssignedTickets, getTickets } from "@/lib/api";
import { useRequireRole } from "@/hooks/use-require-role";
import { FilterTabs } from "@/components/filter-tabs";
import { TicketPanel } from "@/components/ticket-panel";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { StatusFilter, Ticket } from "@/types";

export default function TicketsPage() {
  const { ready, role } = useRequireRole();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [status, setStatus] = useState<StatusFilter>("");
  const [query, setQuery] = useState("");

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

  const count = (s: StatusFilter) =>
    s === "" ? tickets.length : tickets.filter((t) => t.status === s).length;

  const tabs: { value: StatusFilter; label: string }[] = [
    { value: "", label: `All (${count("")})` },
    { value: "Open", label: `Open (${count("Open")})` },
    { value: "InProgress", label: `In progress (${count("InProgress")})` },
    { value: "Closed", label: `Closed (${count("Closed")})` },
  ];

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    return tickets.filter((t) => {
      if (status && t.status !== status) return false;
      if (!q) return true;

      return (
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    });
  }, [tickets, status, query]);

  if (!ready) {
    return <div className="p-6 text-muted-foreground">Loading...</div>;
  }

  const title = role === "Technician" ? "Assigned tickets" : "My tickets";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading
              ? "Loading tickets..."
              : `${visible.length} of ${tickets.length} ticket${tickets.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {role !== "Technician" && (
          <Link href="/tickets/create" className={buttonVariants()}>
            <Plus className="h-4 w-4" />
            New ticket
          </Link>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <FilterTabs
          label="Status"
          value={status}
          onChange={setStatus}
          tabs={tabs}
        />

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
          {tickets.length === 0
            ? "No tickets yet."
            : "No tickets match these filters."}
        </div>
      ) : (
        <TicketPanel title="Tickets" tickets={visible} variant="light" />
      )}
    </div>
  );
}