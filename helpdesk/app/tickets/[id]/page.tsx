"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowUp, CheckCircle2, Pencil, Trash2 } from "lucide-react";

import {
  addCommentToTicket,
  deleteTicket,
  getTicketById,
} from "@/lib/api";
import { useRequireRole } from "@/hooks/use-require-role";
import {
  displayName,
  formatDate,
  formatDateShort,
  shortId,
} from "@/lib/ticket-ui";
import { PriorityMark, StatusMark } from "@/components/status-mark";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { TicketComment, TicketDetails, TicketHistory } from "@/types";

type ActivityItem =
  | { kind: "comment"; id: string; at: string; comment: TicketComment }
  | { kind: "event"; id: string; at: string; event: TicketHistory };

const humanize = (value: string) => value.replace(/([a-z])([A-Z])/g, "$1 $2");

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 text-sm last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}

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

  const activity = useMemo<ActivityItem[]>(() => {
    if (!ticket) return [];

    const items: ActivityItem[] = [
      ...ticket.comments.map(
        (c): ActivityItem => ({
          kind: "comment",
          id: `c-${c.id}`,
          at: c.createdAt,
          comment: c,
        })
      ),
      ...ticket.ticketHistories
        .filter((h) => h.actionType !== "CommentAdded")
        .map(
          (h): ActivityItem => ({
            kind: "event",
            id: `h-${h.id}`,
            at: h.createdAt,
            event: h,
          })
        ),
    ];

    return items.sort((a, b) => +new Date(a.at) - +new Date(b.at));
  }, [ticket]);

  const addComment = async () => {
    if (!comment.trim()) {
      setCommentError("Write a comment before sending.");
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
    return (
      <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-96 max-w-full" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Skeleton className="h-96" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl p-4 md:p-8">
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      </div>
    );
  }

  if (!ticket) {
    return <div className="p-6 text-muted-foreground">Ticket not found.</div>;
  }

  const isStaff = role === "Admin" || role === "Technician";
  const canEdit = ticket.status === "Open" && isStaff;
  const canSolve = ticket.status !== "Closed" && isStaff;
  const canDelete = ticket.status === "Open" && role === "Admin";
  const canComment = ticket.status === "Open" || ticket.status === "InProgress";

  const typeLabel =
    ticket.type === "ServiceRequest" ? "Service request" : ticket.type;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-4 md:p-8">
      {/* Header */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <StatusMark status={ticket.status} />
              <PriorityMark priority={ticket.priority} />

              <span className="text-sm text-muted-foreground">{typeLabel}</span>

              <span className="text-xs text-muted-foreground tabular-nums">
                #{shortId(ticket.id)}
              </span>
            </div>

            <h1 className="text-2xl font-medium tracking-tight">
              <bdi>{ticket.title}</bdi>
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            {canEdit && (
              <Button
                variant="outline"
                onClick={() => router.push(`/tickets/${ticket.id}/edit`)}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            )}

            {canSolve && (
              <Button onClick={() => router.push(`/tickets/${ticket.id}/solve`)}>
                <CheckCircle2 className="h-4 w-4" />
                Solve
              </Button>
            )}

            {canDelete && (
              <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* Main column */}
        <div className="min-w-0 space-y-10">
          <section className="space-y-2">
            <h2 className="text-sm text-muted-foreground">Description</h2>
            <p
              dir="auto"
              className="whitespace-pre-wrap text-[15px] leading-7"
            >
              {ticket.description}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm text-muted-foreground">
              Activity
              <span className="ml-1.5 tabular-nums">({activity.length})</span>
            </h2>

            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing here yet. Be the first to comment.
              </p>
            ) : (
              <ol className="relative ml-2 space-y-6 border-l border-border">
                {activity.map((item) =>
                  item.kind === "event" ? (
                    <li key={item.id} className="relative pl-6">
                      <span className="absolute -left-[5.5px] top-[7px] h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />

                      <p className="text-sm text-muted-foreground">
                        <span className="text-foreground">
                          {humanize(item.event.actionType)}
                        </span>{" "}
                        by{" "}
                        <span title={item.event.performedByUserId}>
                          {displayName(
                            item.event.performedByName,
                            item.event.performedByUserId,
                          )}
                        </span>
                        <span className="mx-1.5">-</span>
                        <span className="tabular-nums">
                          {formatDateShort(item.at)}
                        </span>
                      </p>
                    </li>
                  ) : (
                    <li key={item.id} className="relative pl-6">
                      <span className="absolute -left-[5.5px] top-[7px] h-2.5 w-2.5 rounded-full border-2 border-primary bg-background ring-4 ring-background" />

                      <div className="rounded-lg bg-muted/70 px-4 py-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-[10px]">
                                {displayName(
                                  item.comment.authorName,
                                  item.comment.authorUserId,
                                )
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                              {displayName(
                                item.comment.authorName,
                                item.comment.authorUserId,
                              )}
                            </span>
                          </div>

                          <span className="text-xs text-muted-foreground tabular-nums">
                            {formatDateShort(item.at)}
                          </span>
                        </div>

                        <p
                          dir="auto"
                          className="mt-2 whitespace-pre-wrap text-sm leading-6"
                        >
                          {item.comment.content}
                        </p>
                      </div>
                    </li>
                  )
                )}
              </ol>
            )}

            {canComment ? (
              <div className="space-y-2 pt-2">
                <Textarea
                  dir="auto"
                  rows={3}
                  placeholder="Write a comment..."
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                    setCommentError("");
                  }}
                />

                {commentError && (
                  <p className="text-sm text-destructive">{commentError}</p>
                )}

                <div className="flex justify-end">
                  <Button type="button" disabled={sending} onClick={addComment}>
                    <ArrowUp className="h-4 w-4" />
                    {sending ? "Sending..." : "Send"}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="border-t pt-4 text-sm text-muted-foreground">
                This ticket is closed, so comments are turned off.
              </p>
            )}
          </section>
        </div>

        {/* Details panel */}
        <aside className="dark rounded-lg bg-card p-5 text-card-foreground lg:sticky lg:top-20">
          <h2 className="mb-1 text-sm text-muted-foreground">Details</h2>

          <dl>
            <DetailRow label="Type">{typeLabel}</DetailRow>
            <DetailRow label="Category">{ticket.category}</DetailRow>
            <DetailRow label="Created by">
              <span className="tabular-nums" title={ticket.createdByUserId}>
                {displayName(ticket.createdByName, ticket.createdByUserId)}
              </span>
            </DetailRow>
            <DetailRow label="Assigned to">
              {ticket.assignedTechnicianId ? (
                <span
                  className="tabular-nums"
                  title={ticket.assignedTechnicianId}
                >
                  {displayName(
                    ticket.assignedTechnicianName,
                    ticket.assignedTechnicianId,
                  )}
                </span>
              ) : (
                <span className="text-destructive">Unassigned</span>
              )}
            </DetailRow>
            <DetailRow label="Created">
              <span className="tabular-nums">{formatDate(ticket.createdAt)}</span>
            </DetailRow>
            <DetailRow label="Updated">
              <span className="tabular-nums">
                {ticket.updatedAt ? formatDate(ticket.updatedAt) : "-"}
              </span>
            </DetailRow>
          </dl>
        </aside>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this ticket?</AlertDialogTitle>
            <AlertDialogDescription>
              This can't be undone. The ticket and its comments will be
              permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}