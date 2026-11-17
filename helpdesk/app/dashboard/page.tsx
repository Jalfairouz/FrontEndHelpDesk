"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import {
  getAssignedTickets,
  getMe,
  getSystemTickets,
  getTickets,
} from "@/lib/api";
import { useRequireRole } from "@/hooks/use-require-role";
import { TicketPanel } from "@/components/ticket-panel";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { MeResponse, Role, Ticket } from "@/types";

const LABELS: Record<Role, { title: string; description: string; empty: string }> =
  {
    Employee: {
      title: "My tickets",
      description: "Tickets you created",
      empty: "You haven't created any tickets yet.",
    },
    Technician: {
      title: "Assigned to me",
      description: "Tickets assigned to you",
      empty: "No tickets are assigned to you.",
    },
    Admin: {
      title: "All tickets",
      description: "Tickets from all users",
      empty: "There are no tickets in the system.",
    },
  };

export default function DashboardPage() {
  const { ready, role } = useRequireRole();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready || !role) return;

    let cancelled = false;

    async function loadDashboard() {
      try {
        const ticketsRequest =
          role === "Admin"
            ? getSystemTickets()
            : role === "Technician"
            ? getAssignedTickets()
            : getTickets();

        const [userData, ticketsData] = await Promise.all([
          getMe(),
          ticketsRequest,
        ]);

        if (cancelled) return;
        setUser(userData);
        setTickets(ticketsData);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load dashboard"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [ready, role]);

  if (!ready || loading) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-lg" />
      </div>
    );
  }

  const label = LABELS[role ?? "Employee"];

  const countByStatus = (status: Ticket["status"]) =>
    tickets.filter((ticket) => ticket.status === status).length;

  const stats: { label: string; value: number; dot?: string }[] = [
    { label: label.title, value: tickets.length },
    { label: "Open", value: countByStatus("Open"), dot: "bg-chart-2" },
    {
      label: "In progress",
      value: countByStatus("InProgress"),
      dot: "border-2 border-chart-2",
    },
    {
      label: "Closed",
      value: countByStatus("Closed"),
      dot: "bg-muted-foreground/60",
    },
  ];

  const recent = [...tickets]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 6);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-4 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">
            Welcome{user ? `, ${user.firstName}` : ""}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {label.description}
          </p>
        </div>

        {role !== "Technician" && (
          <Link href="/tickets/create" className={buttonVariants()}>
            <Plus className="h-4 w-4" />
            New ticket
          </Link>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex min-h-28 flex-col justify-between rounded-lg border bg-card p-4 text-card-foreground"
          >
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              {stat.dot && (
                <span className={cn("h-2.5 w-2.5 rounded-full", stat.dot)} />
              )}
              <span className="truncate">{stat.label}</span>
            </p>
            <p className="text-3xl font-medium tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>

      {recent.length === 0 ? (
        <div className="rounded-lg border border-dashed py-14 text-center text-sm text-muted-foreground">
          {label.empty}
        </div>
      ) : (
        <TicketPanel
          variant="light"
          title="Latest tickets"
          tickets={recent}
          canAssign={role === "Admin"}
          action={
            <Link
              href={role === "Admin" ? "/admin/system-tickets" : "/tickets"}
              className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              View all
            </Link>
          }
        />
      )}
    </div>
  );
}