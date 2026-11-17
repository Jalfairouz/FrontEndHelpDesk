"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  assignTicketToTechnician,
  getTechnicians,
  getTicketById,
} from "@/lib/api";
import { useRequireRole } from "@/hooks/use-require-role";
import { Field, FormActions, FormError, FormPage } from "@/components/form-page";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Technician } from "@/types";

const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export default function AssignTicketPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;

  const { ready } = useRequireRole(["Admin"]);

  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [ticketTitle, setTicketTitle] = useState("");
  const [selected, setSelected] = useState("");

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;

    let cancelled = false;

    async function load() {
      try {
        const [techs, ticket] = await Promise.all([
          getTechnicians(),
          getTicketById(ticketId).catch(() => null),
        ]);

        if (cancelled) return;
        setTechnicians(techs);
        setTicketTitle(ticket?.title ?? "");
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

    load();

    return () => {
      cancelled = true;
    };
  }, [ready, ticketId]);

  const handleAssign = async () => {
    if (!selected) {
      setError("Pick a technician first.");
      return;
    }

    setAssigning(true);
    setError("");

    try {
      await assignTicketToTechnician(ticketId, selected);
      router.push(`/tickets/${ticketId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign ticket");
      setAssigning(false);
    }
  };

  if (!ready || loading) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-4 p-4 md:p-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <FormPage
      title="Assign ticket"
      description={
        ticketTitle ? (
          <>
            Choose who will handle <bdi className="text-foreground">{ticketTitle}</bdi>
          </>
        ) : (
          "Choose who will handle this ticket."
        )
      }
    >
      <div className="space-y-6">
        <Field label="Technician">
          {technicians.length === 0 ? (
            <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
              No technicians available.
            </div>
          ) : (
            <ul
              role="radiogroup"
              aria-label="Technician"
              className="divide-y overflow-hidden rounded-lg border"
            >
              {technicians.map((tech) => {
                const isSelected = selected === tech.id;

                return (
                  <li key={tech.id}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      disabled={!tech.isActive}
                      onClick={() => setSelected(tech.id)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                        isSelected ? "bg-primary/10" : "hover:bg-muted/60",
                        !tech.isActive && "cursor-not-allowed opacity-50"
                      )}
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-xs">
                          {initialsOf(tech.displayName)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">{tech.displayName}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {tech.email}
                        </p>
                      </div>

                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            tech.isActive
                              ? "bg-chart-2"
                              : "bg-muted-foreground/50"
                          )}
                        />
                        {tech.isActive ? "Active" : "Inactive"}
                      </span>

                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                          isSelected ? "border-primary" : "border-input"
                        )}
                      >
                        {isSelected && (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Field>

        <FormError message={error} />

        <FormActions>
          <Button
            type="button"
            variant="outline"
            disabled={assigning}
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!selected || assigning}
            onClick={handleAssign}
          >
            {assigning ? "Assigning..." : "Assign ticket"}
          </Button>
        </FormActions>
      </div>
    </FormPage>
  );
}