"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlignLeft, ArrowLeft, FileText } from "lucide-react";

import {
  addCommentToTicket,
  getTicketById,
  updateTicketStatus,
} from "@/lib/api";
import { useRequireRole } from "@/hooks/use-require-role";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
      setError("Please add a comment before closing the ticket.");
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
    } finally {
      setSaving(false);
    }
  };

  if (!ready || loading) {
    return <div className="p-6">Loading...</div>;
  }

  const isClosed = ticket?.status === "Closed";

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Solve Ticket</CardTitle>
              <CardDescription>Update the ticket status</CardDescription>
            </div>

            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Ticket Details</Label>

            <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 h-4 w-4 text-primary" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Title</p>
                  <p className="mt-1 text-sm font-medium">
                    {ticket?.title || "No title"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlignLeft className="mt-0.5 h-4 w-4 text-primary" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                    {ticket?.description || "No description"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {isClosed ? (
            <div className="rounded-md border p-3 text-sm text-muted-foreground">
              This ticket is closed and can no longer be changed.
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Status</Label>

                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as TicketStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="InProgress">In Progress</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {status === "Closed" && (
                <div className="space-y-2">
                  <Label htmlFor="comment">Comment</Label>
                  <Textarea
                    id="comment"
                    placeholder="Add a comment before closing the ticket..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={saving}
                >
                  Cancel
                </Button>

                <Button onClick={handleSubmit} disabled={saving}>
                  {saving ? "Saving..." : "Update Status"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}