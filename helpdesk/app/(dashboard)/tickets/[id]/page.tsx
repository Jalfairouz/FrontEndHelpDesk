"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ArrowUp,
  Calendar,
  Clock,
  Tag,
  User,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getTicketById,  addCommentToTicket, deleteTicket } from "@/lib/api";

import { getRole, getToken, decodeToken } from "@/lib/auth";

import type { TicketDetails  } from "@/types";

export default function TicketDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const ticketId = params.id as string;
   
  const [ticket, setTicket] = useState<TicketDetails  | null>(null);

  const [comment, setComment] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentError, setCommentError] = useState("");
      const token = getToken();
    const decoded = token ? decodeToken(token) : null;
const [deleteOpen, setDeleteOpen] = useState(false);
  useEffect(() => {
    async function loadTicket() {
      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const data = await getTicketById(ticketId);
        setTicket(data);

      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load ticket"
        );
      } finally {
        setLoading(false);
      }
    }

    loadTicket();
  }, [ticketId, router]);
const addComment = async () => {
  try {
    if (!comment.trim()) {
    setCommentError("The Content field is required.");
    return;
  }
    const data = await addCommentToTicket(ticketId, comment);

    setTicket((prev) =>
      prev
        ? {
            ...prev,
            comments: [...prev.comments, data],
          }
        : null
    );
    setComment("");
  } catch (err) {
    setCommentError(
      err instanceof Error
        ? err.message
        : "Failed to add comment"
    );
  } finally {
    setLoading(false);
  }
};
const handleDelete = async () => {
  setError("");
  setLoading(true);

  try {
    await deleteTicket(ticketId);
    router.push("/tickets");
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Failed to delete ticket"
    );
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <div className="p-6">
        Loading ticket...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        {error}
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-6">
        Ticket not found
      </div>
    );
  }

  return (
  <div className="container mx-auto max-w-5xl space-y-8 p-6">

    {/* Header */}
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Ticket Details
        </h1>

        <p className="mt-2 text-muted-foreground">
          View and track your support ticket
        </p>
      </div>

      <Button
        type="button"
        className=""
        variant="outline"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      
      
    </div>

   
    <Card className="overflow-hidden">

      
      <CardHeader className="border-b bg-muted/30">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

          <div className="space-y-2">
            <CardTitle className="text-2xl">
              {ticket.title}
            </CardTitle>

            <CardDescription>
              Ticket ID: {ticket.id}
              
            </CardDescription>
          </div>
          {/* Status */}
          <div className="flex flex-col items-center gap-3">
  <Badge
    className={
      ticket.status === "Open"
        ? "bg-green-100 text-green-700 hover:bg-green-100 w-50"
        : ticket.status === "InProgress"
        ? "bg-blue-100 text-blue-700 hover:bg-blue-100 w-50 "
        : "bg-gray-100 text-gray-700 hover:bg-gray-100  w-50"
    }
  >
    {ticket.status}
  </Badge>
{ticket.status === "Open" &&
  decoded &&
  ["Admin", "Technician"].includes(getRole(decoded) ?? "") && (
    <>
      <div className="flex gap-2">
        <Button
          className="w-24"
          variant="outline"
          size="sm"
          onClick={() =>
            router.push(`/tickets/${ticket.id}/edit`)
          }
        >
          Edit
        </Button>

        <Button
            className="w-24 bg-red-600 text-white hover:bg-red-700"
            size="sm"
          onClick={() => setDeleteOpen(true)}
        >
          Delete
        </Button>
      </div>

      <AlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this ticket?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This action cannot be undone. The ticket will be
              permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )}

</div>

        </div>
      </CardHeader>

      <CardContent className="space-y-8 p-6">

       
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">
            Description
          </h2>

          <div className="rounded-lg border bg-muted/20 p-4">
            <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {ticket.description}
            </p>
          </div>
        </div>

        <Separator />

       
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Ticket Information
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="h-4 w-4" />
                Priority
              </div>

              <div className="mt-2">
                <Badge
                  variant="outline"
                  className={
                    ticket.priority === "High"
                      ? "border-red-300 text-red-600"
                      : ticket.priority === "Medium"
                      ? "border-yellow-300 text-yellow-600"
                      : "border-green-300 text-green-600"
                  }
                >
                  {ticket.priority}
                </Badge>
              </div>
            </div>

           
            <div className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground">
                Type
              </div>

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

              <p className="mt-2 font-medium">
                {ticket.category}
              </p>
            </div>

            {/* Assigned To */}
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
                {ticket.ticketHistories.map((history) => (
                    history.actionType !== "CommentAdded" && (
                        <tr
                        key={history.id}
                        className="border-b last:border-0"
                        >
                        <td className="px-4 py-3">
                            {new Date(history.createdAt).toLocaleString()}
                        </td>

                        <td className="px-4 py-3">
                            {history.actionType}
                        </td>

                        <td className="px-4 py-3">
                            {history.performedByUserId}
                        </td>
                        </tr>
                    )
                    ))}
                </tbody>
            </table>
            </div>
<Separator />
        {/* Dates */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Timeline
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">

            <div className="flex items-center gap-3 rounded-lg border p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Created At
                </p>

                <p className="font-medium">
                  {new Date(ticket.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Last Updated
                </p>

                <p className="font-medium">
                  {ticket.updatedAt
                    ? new Date(ticket.updatedAt).toLocaleString()
                    : "Not updated"}
                </p>
              </div>
            </div>

          </div>
        </div>

        <>
            <Separator />

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                Comments
              </h2>
        {ticket.comments.length > 0 ? (
          

              <div className="space-y-4">
                {ticket.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          <User className="h-4 w-4" />
                        </div>

                        <span className="text-sm font-medium">
                          {comment.authorName}
                        </span>
                      </div>

                      <span className="text-xs text-muted-foreground">
                        {new Date(
                          comment.createdAt
                        ).toLocaleString()}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {comment.content}
                    </p>
                  </div>
                ))}
                </div>
        ) 
        : (
          <div className="p-6">
            <p className="text-sm text-muted-foreground">No comments yet.</p>
          </div>
        )
        }
            </div>
          </>

        {(ticket?.status === "Open" || ticket?.status === "InProgress") && (
        <div className=" ">
                  <Textarea
                    placeholder="Write comment..."
                    className="flex-1"
                    value={comment}
                    onChange={(e) => {
                  setComment(e.target.value);
                  setCommentError("");
                }}
                  />
                  {commentError && (
                    <div className="rounded-md    p-1 text-sm text-red-600">
                      {commentError}
                    </div>
                  )}
                  <Button
                  className="w-full"
                    type="button"
                    
                    onClick={() => addComment()}
                    
                >
                    <ArrowUp className="flex h-12 w-4" />
                    {loading ? "Sending..." : "Send"}
                </Button>
                
                </div>
        )}
      </CardContent>
    </Card>
  </div>
);

}
