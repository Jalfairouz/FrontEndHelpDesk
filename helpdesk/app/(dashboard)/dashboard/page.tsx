"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getTickets, getMe } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MeResponse, Ticket } from "@/types";
import { User } from "lucide-react";

export default function DashboardPage() {
    const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [userData, ticketsData] = await Promise.all([
          getMe(),
          getTickets(),
        ]);

        setUser(userData);
        setTickets(ticketsData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  const totalTickets = tickets.length;

  const openTickets = tickets.filter(
    (ticket) => ticket.status === "Open"
  ).length;

  const inProgressTickets = tickets.filter(
    (ticket) => ticket.status === "InProgress"
  ).length;

  const closedTickets = tickets.filter(
    (ticket) => ticket.status === "Closed"
  ).length;

  // باقي JSX...


  return  (
  <div className="container mx-auto space-y-8 p-6">
    <div className="relative">
  <div>
    <h1 className="text-3xl font-bold tracking-tight">
      Dashboard
    </h1>

    <p className="text-muted-foreground pb-4">
      Welcome to your IT Help Desk
    </p>
  </div>
   <div className="flex items-center gap-8 rounded-lg border bg-background px-4 py-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <User className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="leading-tight">
        <p className="font-medium">
          {user?.firstName} {user?.lastName}
        </p>

        <p className="text-sm text-muted-foreground">
          {user?.email}
        </p>
      </div>
    </div>

  
</div>
    
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>My Tickets</CardTitle>
          <CardDescription>
            Total tickets you created
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="text-3xl font-bold">
            {tickets.length}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Open</CardTitle>
          <CardDescription>
            Tickets waiting to be handled
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="text-3xl font-bold">
            {openTickets}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>In Progress</CardTitle>
          <CardDescription>
            Tickets being handled
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="text-3xl font-bold">
            {inProgressTickets}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Closed</CardTitle>
          <CardDescription>
            Completed tickets
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="text-3xl font-bold">
            {closedTickets}
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Tickets */}
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>My Tickets</CardTitle>

        <CardDescription>
          Your recent IT support tickets
        </CardDescription>
        
      <Button onClick={() => router.push("/tickets/create")}>
        Create New Ticket
      </Button>
        
      </CardHeader>
        
      <CardContent>
        {tickets.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            You don't have any tickets yet.
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <h2 className="font-medium">
                    {ticket.title}
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    {ticket.category} · {ticket.priority} · {ticket.createdAt} · {ticket.status}
                  </p>
                </div>

                
                <div className="text-xs">
                  <button
                    onClick={() => router.push(`/tickets/${ticket.id}`)}
                    className="rounded-md border px-4 py-2 hover:bg-gray-100"
                    >
                    View Ticket
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>

   
    
  </div>
);

}
