"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  addCommentToTicket,
  getTicketById,
  updateTicketStatus,
} from "@/lib/api";
import { useRequireRole } from "@/hooks/use-require-role";
import { Field, FormActions, FormError, FormPage } from "@/components/form-page";
import { Segmented } from "@/components/segmented";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { TicketDetails, TicketStatus } from "@/types";

export default function SolveTicketPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;

  const { ready } = useRequireRole(["Technician", "Admin"]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [status, setStatus] = useState<TicketStatus>("InProgress");
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!ready) return;

    let cancelled = false;

    async function loadTicket() {
      try {
        const data = await getTicketById(ticketId);
        if (cancelled) return;

        setTicket(data);
        setStatus(data.status === "Closed" ? "Closed" : "InProgress");
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

  const handleSubmit = async () => {
    setError("");

    if (status === "Closed" && !comment.trim()) {
      setError("Add a resolution note before closing the ticket.");
      return;
    }

    setSaving(true);

    try {
      if (status === "InProgress") {
        if (ticket?.status !== "InProgress") {
          await updateTicketStatus(ticketId, "InProgress");
        }
      } else {
        await addCommentToTicket(ticketId, comment.trim());
        await updateTicketStatus(ticketId, "Closed");
      }

      router.push(`/tickets/${ticketId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update ticket");
      setSaving(false);
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

  const isClosed = ticket?.status === "Closed";

  return (
    <FormPage title="Update status" description="Move the ticket forward or close it.">
      <div className="space-y-8">
        {ticket && (
          <section className="space-y-1 border-l-2 border-primary pl-4">
            <p dir="auto" className="font-medium">
              <bdi>{ticket.title}</bdi>
            </p>
            <p
              dir="auto"
              className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground"
            >
              {ticket.description}
            </p>
          </section>
        )}

        {isClosed ? (
          <div className="rounded-md border p-3 text-sm text-muted-foreground">
            This ticket is closed and can't be changed anymore.
          </div>
        ) : (
          <div className="space-y-6">
            <Field label="Outcome">
              <Segmented
                label="Outcome"
                value={status}
                onChange={setStatus}
                options={[
                  { value: "InProgress", label: "Keep in progress" },
                  { value: "Closed", label: "Close ticket" },
                ]}
              />
            </Field>

            {status === "Closed" && (
              <Field
                label="Resolution note"
                htmlFor="comment"
                hint="Added to the ticket as a comment before it closes."
              >
                <Textarea
                  id="comment"
                  dir="auto"
                  rows={4}
                  placeholder="What fixed the problem?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </Field>
            )}

            <FormError message={error} />

            <FormActions>
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="button" disabled={saving} onClick={handleSubmit}>
                {saving
                  ? "Saving..."
                  : status === "Closed"
                  ? "Close ticket"
                  : "Save"}
              </Button>
            </FormActions>
          </div>
        )}

        {isClosed && error && <FormError message={error} />}
      </div>
    </FormPage>
  );
}