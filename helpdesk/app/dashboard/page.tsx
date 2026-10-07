"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";

import {
  getAssignedTickets,
  getMe,
  getSystemTickets,
  getTickets,
} from "@/lib/api";
import { useRequireRole } from "@/hooks/use-require-role";
import { formatDate } from "@/lib/ticket-ui";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MeResponse, Role, Ticket } from "@/types";

const LABELS: Record<Role, { title: string; description: string; empty: string }> =
  {
    Employee: {
      title: "My Tickets",
      description: "Tickets you created",
      empty: "You don't have any tickets yet.",
    },
    Technician: {
      title: "Assigned Tickets",
      description: "Tickets assigned to you",
      empty: "No tickets are assigned to you.",
    },
    Admin: {
      title: "System Tickets",
      description: "Tickets created by other users",
      empty: "There are no system tickets.",
    },
  };

export default function DashboardPage() {
  const router = useRouter();
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
    return <div className="p-6">Loading...</div>;
  }

  const label = LABELS[role ?? "Employee"];

  const countByStatus = (status: Ticket["status"]) =>
    tickets.filter((ticket) => ticket.status === status).length;

  return (
    <div className="container mx-auto space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="pb-4 text-muted-foreground">
          Welcome to your IT Help Desk
        </p>

        <div className="flex items-center gap-8 rounded-lg border bg-background px-4 py-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="leading-tight">
            <p className="font-medium">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>{label.title}</CardTitle>
            <CardDescription>{label.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tickets.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open</CardTitle>
            <CardDescription>Tickets waiting to be handled</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{countByStatus("Open")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>In Progress</CardTitle>
            <CardDescription>Tickets being handled</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {countByStatus("InProgress")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Closed</CardTitle>
            <CardDescription>Completed tickets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{countByStatus("Closed")}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>{label.title}</CardTitle>
          <CardDescription>Your recent IT support tickets</CardDescription>

          {role !== "Technician" && (
            <Button onClick={() => router.push("/tickets/create")}>
              Create New Ticket
            </Button>
          )}
        </CardHeader>

        <CardContent>
          {tickets.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              {label.empty}
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <h2 className="font-medium">{ticket.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {ticket.category} · {ticket.priority} ·{" "}
                      {formatDate(ticket.createdAt)} · {ticket.status}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/tickets/${ticket.id}`)}
                  >
                    View Ticket
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}