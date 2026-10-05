"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getAssignedTickets } from "@/lib/api";
import { getToken, getRole, decodeToken, getUserId } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge";
import type {  Ticket } from "@/types";

export default function TicketsPage() {
    const router = useRouter();
    const token = getToken();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const decoded = token ? decodeToken(token) : null;
    const currentUserId = decoded ? getUserId(decoded) : null;
    useEffect(() => {
        async function loadTickets() {
            const token = getToken();

            if (!token) {
            router.replace("/login");
            return;
        }

        const decoded = decodeToken(token);

        if (!decoded) {
            router.replace("/login");
            return;
        }

        

        if (getRole(decoded) !== "Technician") {
            router.replace("/dashboard");
            return;
        }

            try {
                const [ticketsData] = await Promise.all([
                
                getAssignedTickets(),
                
            ]);

            
            setTickets(ticketsData);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        loadTickets();
    }, [router]);

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }
   


    return  (
        <div >
            
            {tickets.length === 0 ? (

                <div className="py-10 text-center text-muted-foreground">
                    You don't have any assigned tickets yet.
                </div>
            ) : (
                <div className="space-y-2">
                    
                 {tickets.map((ticket) => (
                    
                    <div
            key={ticket.id}
             className=" rounded-lg  p-2 space-y-4"
           >
            
                <Card className="relative">
                    <CardHeader>
                    <CardTitle  className="flex items-center justify-between"> 
                       <div className="flex items-center gap-2">
                        {ticket.title}
                        </div>
                        <div className="flex items-center gap-2">
                           
                        <div className="text-xs text-muted-foreground">
                            {ticket.createdAt}
                        </div>
                        
                      </div>
                        </CardTitle>
                        
                    <CardDescription className="text-sm">{ticket.description}</CardDescription>
                    
                    </CardHeader>
                    <CardContent>
                        <div
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
                                ticket.status === "Open"
                                ? "border-green-200 bg-green-50 text-green-700"
                                : ticket.status === "InProgress"
                                ? "border-blue-200 bg-blue-50 text-blue-700"
                                : ticket.status === "Closed"
                                ? "border-red-200 bg-red-50 text-red-700"
                                : "border-gray-200 bg-gray-50 text-gray-700"
                            }`}
                            >
                            <span
                                className={`mr-2 h-1.5 w-1.5 rounded-full ${
                                ticket.status === "Open"
                                    ? "bg-green-500"
                                    : ticket.status === "InProgress"
                                    ? "bg-blue-500"
                                    : ticket.status === "Closed"
                                    ? "bg-red-500"
                                    : "bg-gray-500"
                                }`}
                            />

                            {ticket.status === "InProgress"
                                ? "In Progress"
                                : ticket.status}
                            </div>
                  
                

                    </CardContent>
                    <CardFooter className="  gap-4 p-4">
                        <Button
                            className="flex-5"
                            variant="outline"
                            onClick={() => router.push(`/tickets/${ticket.id}`)}
                        >
                            View
                        </Button>
                        {["Open", "InProgress"].includes(ticket.status) &&
                            decoded &&
                            ["Admin", "Technician"].includes(getRole(decoded) ?? "") && (
                                <Button
                                className="flex-1"
                                variant="default"
                                onClick={() =>
                                    router.push(`/technician/tickets/${ticket.id}/solve`)
                                }
                                >
                                Solve
                                </Button>
                            )}

                        </CardFooter>

                    </Card>
                    </div>
                    ))}
            </div>     
            )}
                
        </div>
  );

}