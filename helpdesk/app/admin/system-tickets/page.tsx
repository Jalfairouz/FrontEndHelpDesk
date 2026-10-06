"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Filter,
  RotateCcw,
  
} from "lucide-react";

import { getSystemTickets } from "@/lib/api";
import type { Ticket } from "@/types";

type StatusFilter = "" | "Open" | "InProgress" | "Closed";

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [status, setStatus] = useState<StatusFilter>("");
  const [unassigned, setUnassigned] = useState(false);

  const loadTickets = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getSystemTickets({
        status: status || undefined,
        unassigned: unassigned ? true : undefined,
      });

      setTickets(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load tickets"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [status, unassigned]);

  const resetFilters = () => {
    setStatus("");
    setUnassigned(false);
  };

  const getStatusClass = (ticketStatus: string) => {
    switch (ticketStatus) {
      case "Open":
        return "bg-green-100 text-green-700 hover:bg-green-100";

      case "InProgress":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100";

      case "Closed":
        return "bg-gray-100 text-gray-700 hover:bg-gray-100";

      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-100";
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "High":
        return "border-red-300 text-red-600";

      case "Medium":
        return "border-yellow-300 text-yellow-600";

      case "Low":
        return "border-green-300 text-green-600";

      default:
        return "";
    }
  };

  return (
    <div className="container mx-auto space-y-8 p-6">

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          System Tickets
        </h1>

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

            {/* Status */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="status"
                className="text-sm font-medium"
              >
                Status
              </label>

              <select
                id="status"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as StatusFilter)
                }
                className="h-10 rounded-md border bg-background px-3 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="Open">Open</option>
                <option value="InProgress">
                  In Progress
                </option>
                <option value="Closed">Closed</option>
              </select>
            </div>


            <label className="flex h-10 items-center gap-2 rounded-md border px-3 text-sm">
              <input
                type="checkbox"
                checked={unassigned}
                onChange={(e) =>
                  setUnassigned(e.target.checked)
                }
                className="h-4 w-4"
              />

              Unassigned
            </label>

            {/* Reset */}
            <Button
              type="button"
              variant="outline"
              onClick={resetFilters}
            >
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tickets</CardTitle>

              <CardDescription>
                {loading
                  ? "Loading tickets..."
                  : `${tickets.length} ticket${
                      tickets.length === 1 ? "" : "s"
                    } found`}
              </CardDescription>
            </div>

            
          </div>
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
                <div
                  key={ticket.id}
                  className="rounded-lg border p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    {/* Ticket information */}
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        
                          {ticket.title}
                        

                        <Badge
                          className={getStatusClass(
                            ticket.status
                          )}
                        >
                          {ticket.status}
                        </Badge>

                        <Badge
                          variant="outline"
                          className={getPriorityClass(
                            ticket.priority
                          )}
                        >
                          {ticket.priority}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span>
                          Category: {ticket.category}
                        </span>

                        <span>
                          Created:{" "}
                          {new Date(
                            ticket.createdAt
                          ).toLocaleString()}
                        </span>
                      </div>

                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          Assigned to:{" "}
                        </span>

                        {ticket.assignedTechnicianId ? (
                          <span className="font-medium">
                            {ticket.assignedTechnicianId}
                          </span>
                        ) : (
                          <span className="font-medium text-orange-600">
                            Not assigned
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        
                      >
                        <Link
                          href={`/tickets/${ticket.id}`}
                        >
                          View
                        </Link>
                      </Button>
                        {!ticket.assignedTechnicianId && (
                        <Button size="sm" >
                            <Link href={`/tickets/${ticket.id}/assign`}>
                            Assign
                            </Link>
                        </Button>
                        )}
                    </div>
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