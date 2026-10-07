"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUp,
  Calendar,
  Clock,
  Tag,
  User,
} from "lucide-react";

import {
  addCommentToTicket,
  deleteTicket,
  getTicketById,
} from "@/lib/api";
import { useRequireRole } from "@/hooks/use-require-role";
import { formatDate, getPriorityClass, getStatusClass } from "@/lib/ticket-ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { TicketDetails } from "@/types";

export default function TicketDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;

  const { ready, role } = useRequireRole();

  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [commentError, setCommentError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (!ready) return;

    let cancelled = false;

    async function loadTicket() {
      try {
        const data = await getTicketById(ticketId);
        if (!cancelled) setTicket(data);
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

  const addComment = async () => {
    if (!comment.trim()) {
      setCommentError("The Content field is required.");
      return;
    }

    setSending(true);

    try {
      const data = await addCommentToTicket(ticketId, comment.trim());

      setTicket((prev) =>
        prev ? { ...prev, comments: [...prev.comments, data] } : null
      );
      setComment("");
    } catch (err) {
      setCommentError(
        err instanceof Error ? err.message : "Failed to add comment"
      );
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    setError("");
    setLoading(true);

    try {
      await deleteTicket(ticketId);
      router.push(role === "Admin" ? "/admin/system-tickets" : "/tickets");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete ticket");
      setLoading(false);
    }
  };

  if (!ready || loading) {
    return <div className="p-6">Loading ticket...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!ticket) {
    return <div className="p-6">Ticket not found</div>;
  }

  const isStaff = role === "Admin" || role === "Technician";
  const canEdit = ticket.status === "Open" && isStaff;
  const canSolve = ticket.status !== "Closed" && isStaff;
  const canDelete = ticket.status === "Open" && role === "Admin";
  const canComment = ticket.status === "Open" || ticket.status === "InProgress";

  const histories = ticket.ticketHistories.filter(
    (history) => history.actionType !== "CommentAdded"
  );

  return (
    <div className="container mx-auto max-w-5xl space-y-8 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ticket Details</h1>
          <p className="mt-2 text-muted-foreground">
            View and track your support ticket
          </p>
        </div>

        <Button type="button" variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{ticket.title}</CardTitle>
              <CardDescription>Ticket ID: {ticket.id}</CardDescription>
            </div>

            <div className="flex flex-col items-center gap-3">
              <Badge className={`w-50 ${getStatusClass(ticket.status)}`}>
                {ticket.status}
              </Badge>

              {(canEdit || canSolve || canDelete) && (
                <div className="flex flex-wrap justify-center gap-2">
                  {canEdit && (
                    <Button
                      className="w-24"
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/tickets/${ticket.id}/edit`)}
                    >
                      Edit
                    </Button>
                  )}

                  {canSolve && (
                    <Button
                      className="w-24"
                      size="sm"
                      onClick={() => router.push(`/tickets/${ticket.id}/solve`)}
                    >
                      Solve
                    </Button>
                  )}

                  {canDelete && (
                    <Button
                      className="w-24 bg-red-600 text-white hover:bg-red-700"
                      size="sm"
                      onClick={() => setDeleteOpen(true)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 p-6">
          {/* Description */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Description</h2>
            <div className="rounded-lg border bg-muted/20 p-4">
              <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {ticket.description}
              </p>
            </div>
          </div>

          <Separator />

          {/* Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Ticket Information</h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  Priority
                </div>
                <div className="mt-2">
                  <Badge
                    variant="outline"
                    className={getPriorityClass(ticket.priority)}
                  >
                    {ticket.priority}
                  </Badge>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Type</div>
                <p className="mt-2 font-medium">
                  {ticket.type === "ServiceRequest"
                    ? "Service Request"
                    : ticket.type}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  Category
                </div>
                <p className="mt-2 font-medium">{ticket.category}</p>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  Assigned To
                </div>
                <p className="mt-2 font-medium">
                  {ticket.assignedTechnicianId || "Not assigned"}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* History */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">History</h2>
            <div className="rounded-lg border p-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Action</th>
                    <th className="px-4 py-3 text-left">Performed By</th>
                  </tr>
                </thead>
                <tbody>
                  {histories.map((history) => (
                    <tr key={history.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        {formatDate(history.createdAt)}
                      </td>
                      <td className="px-4 py-3">{history.actionType}</td>
                      <td className="px-4 py-3">{history.performedByUserId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Separator />

          {/* Timeline */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Timeline</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p className="font-medium">{formatDate(ticket.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">
                    {ticket.updatedAt
                      ? formatDate(ticket.updatedAt)
                      : "Not updated"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Comments */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Comments</h2>

            {ticket.comments.length > 0 ? (
              <div className="space-y-4">
                {ticket.comments.map((item) => (
                  <div key={item.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          <User className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium">
                          {item.authorName ?? item.authorUserId}
                        </span>
                      </div>

                      <span className="text-xs text-muted-foreground">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {item.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6">
                <p className="text-sm text-muted-foreground">No comments yet.</p>
              </div>
            )}
          </div>

          {canComment && (
            <div className="space-y-2">
              <Textarea
                placeholder="Write comment..."
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  setCommentError("");
                }}
              />

              {commentError && (
                <div className="p-1 text-sm text-red-600">{commentError}</div>
              )}

              <Button
                className="w-full"
                type="button"
                disabled={sending}
                onClick={addComment}
              >
                <ArrowUp className="h-4 w-4" />
                {sending ? "Sending..." : "Send"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this ticket?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The ticket will be permanently
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}