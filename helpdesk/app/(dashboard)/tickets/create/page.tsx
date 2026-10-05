"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createTicket } from "@/lib/api";
import type {
    TicketPriority,
    TicketType,
    TicketCategory,
} from "@/types";

export default function TicketsPage() {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [priority, setPriority] =
        useState<TicketPriority>("Low");

    const [type, setType] =
        useState<TicketType>("Incident");

    const [category, setCategory] =
        useState<TicketCategory>("Hardware");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

            async function handleSubmit( e: React.FormEvent<HTMLFormElement>) {
            e.preventDefault();

            setLoading(true);
            setError("");

            try {
                const data = await createTicket({
                title,
                description,
                priority,
                type,
                category,
                });

                router.push(`/tickets/${data.id}`);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to create ticket"
                );
            } finally {
                setLoading(false);
            }
        }
   return (
    <div className="container mx-auto max-w-3xl p-6">
        <Card>
            <CardHeader>
                <CardTitle>Create Ticket</CardTitle>

                <CardDescription>
                    Create a new IT support ticket
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    {/* Title */}
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
                    
                    
                    {error && (
                        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    
                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                router.back()
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating..."
                                : "Create Ticket"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    </div>
);
}