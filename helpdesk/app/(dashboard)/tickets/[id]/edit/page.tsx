"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  Save,
} from "lucide-react";
import { getToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { TicketDetails  } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getTicketById, updateTicket } from "@/lib/api";
import { TicketPriority, TicketCategory, TicketType } from "@/types";
export default function EditTicketPage() {
  const router = useRouter();

const params = useParams();
const ticketId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
    const [ticket, setTicket] = useState<TicketDetails  | null>(null);
  const [priority, setPriority] = useState("");
 const [category, setCategory] = useState("");
  const [type, setType] = useState("");
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
      setTitle(data.title);
      setDescription(data.description);
      setPriority(data.priority);
      setCategory(data.category);
      setType(data.type);
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

  const handleSubmit = async () => {
    setError("");
    setSaving(true);

    try {
      await updateTicket(ticketId, {
        title,
        description,
        type : type as TicketType,
        category : category as TicketCategory,
        priority : priority as TicketPriority

        
      });

      router.push(`/tickets/${ticketId}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update ticket"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }
  return (
    <div className="container mx-auto max-w-3xl p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Edit Ticket</CardTitle>

              <CardDescription>
                Update ticket information
              </CardDescription>
            </div>

            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-2">
                        <Label htmlFor="title">
                            Title
                        </Label>

                        <Input
                            id="title"
                            placeholder="e.g. My laptop is not working"
                            value={title}
                            onChange={(e) =>
                                setTitle(e.target.value)
                            }
                            required
                        />
                        </div>

         {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">
                            Description
                        </Label>

                        <Textarea
                            id="description"
                            placeholder="Describe your problem..."
                            className="min-h-[150px]"
                            value={description}
                            onChange={(e) =>
                                setDescription(e.target.value)
                            }
                            required
                        />
                    </div>
             {/* Type */}
                    
                    <div className="space-y-2">
                        <Label>Type</Label>

                        <Select
                            value={type}
                            onValueChange={(value) =>
                                setType(value as TicketType)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="Incident">
                                    Incident
                                </SelectItem>

                                <SelectItem value="ServiceRequest">
                                    Service Request
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
          
                    
                    
                    {error && (
                        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    
                    <div className="space-y-2">
                        <Label>Category</Label>

                        <Select
                            value={category}
                            onValueChange={(value) =>
                                setCategory(
                                    value as TicketCategory
                                )
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="Hardware">
                                    Hardware
                                </SelectItem>

                                <SelectItem value="Software">
                                    Software
                                </SelectItem>

                                <SelectItem value="Network">
                                    Network
                                </SelectItem>

                                <SelectItem value="Access">
                                    Access
                                </SelectItem>

                                <SelectItem value="Email">
                                    Email
                                </SelectItem>

                                <SelectItem value="Security">
                                    Security
                                </SelectItem>

                                <SelectItem value="Other">
                                    Other
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Priority</Label>

                        <Select
                            value={priority}
                            onValueChange={(value) =>
                                setPriority(
                                    value as TicketPriority
                                )
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="Low">
                                    Low
                                </SelectItem>

                                <SelectItem value="Medium">
                                    Medium
                                </SelectItem>

                                <SelectItem value="High">
                                    High
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={saving}
            >
              <Save className="mr-2 h-4 w-4" />

              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}