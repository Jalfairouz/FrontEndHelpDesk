"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, User } from "lucide-react";

import { assignTicketToTechnician, getTechnicians } from "@/lib/api";
import { useRequireRole } from "@/hooks/use-require-role";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Technician } from "@/types";

export default function AssignTicketPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;

  const { ready } = useRequireRole(["Admin"]);

  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState("");

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;

    let cancelled = false;

    async function loadTechnicians() {
      try {
        const data = await getTechnicians();
        if (!cancelled) setTechnicians(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load technicians"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTechnicians();

    return () => {
      cancelled = true;
    };
  }, [ready]);

  const handleAssign = async () => {
    if (!selectedTechnician) {
      setError("Please select a technician.");
      return;
    }

    try {
      setAssigning(true);
      setError("");

      await assignTicketToTechnician(ticketId, selectedTechnician);

      router.push(`/tickets/${ticketId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign ticket");
    } finally {
      setAssigning(false);
    }
  };

  if (!ready || loading) {
    return <div className="container mx-auto p-6">Loading technicians...</div>;
  }

  return (
    <div className="container mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assign Ticket</h1>
          <p className="mt-2 text-muted-foreground">
            Select a technician to assign this ticket to.
          </p>
        </div>

        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Available Technicians</CardTitle>
          <CardDescription>Choose a technician for ticket #{ticketId}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {technicians.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              No technicians available.
            </div>
          ) : (
            <div className="space-y-3">
              {technicians.map((technician) => {
                const selected = selectedTechnician === technician.id;

                return (
                  <button
                    key={technician.id}
                    type="button"
                    disabled={!technician.isActive}
                    onClick={() => setSelectedTechnician(technician.id)}
                    className={`w-full rounded-lg border p-4 text-left transition ${
                      selected
                        ? "border-primary bg-primary/5 ring-2 ring-primary"
                        : "hover:bg-muted/50"
                    } ${
                      !technician.isActive ? "cursor-not-allowed opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <User className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="font-medium">{technician.displayName}</p>
                          <p className="text-sm text-muted-foreground">
                            {technician.email}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-sm ${
                          technician.isActive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {technician.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <Button
            className="w-full"
            disabled={!selectedTechnician || assigning}
            onClick={handleAssign}
          >
            {assigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {assigning ? "Assigning..." : "Assign Ticket"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}