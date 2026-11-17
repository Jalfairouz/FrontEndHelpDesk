"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getTicketById, updateTicket } from "@/lib/api";
import { useRequireRole } from "@/hooks/use-require-role";
import { FormError, FormPage } from "@/components/form-page";
import { TicketForm, type TicketFormValues } from "@/components/ticket-form";
import { Skeleton } from "@/components/ui/skeleton";
import type { TicketCategory, TicketPriority, TicketType } from "@/types";

export default function EditTicketPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;

  const { ready } = useRequireRole(["Technician", "Admin"]);

  const [initial, setInitial] = useState<TicketFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;

    let cancelled = false;

    async function loadTicket() {
      try {
        const data = await getTicketById(ticketId);
        if (cancelled) return;

        setInitial({
          title: data.title,
          description: data.description,
          type: data.type as TicketType,
          category: data.category as TicketCategory,
          priority: data.priority as TicketPriority,
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load ticket");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTicket();

    return () => {
      cancelled = true;
    };
  }, [ready, ticketId]);

  async function handleSubmit(values: TicketFormValues) {
    setSaving(true);
    setError("");

    try {
      await updateTicket(ticketId, values);
      router.push(`/tickets/${ticketId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update ticket");
      setSaving(false);
    }
  }

  if (!ready || loading) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-4 p-4 md:p-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  return (
    <FormPage title="Edit ticket" description="Update the ticket details.">
      {initial ? (
        <TicketForm
          initial={initial}
          submitLabel="Save changes"
          savingLabel="Saving..."
          saving={saving}
          error={error}
          onSubmit={handleSubmit}
        />
      ) : (
        <FormError message={error || "Ticket not found."} />
      )}
    </FormPage>
  );
}