"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  
  User,
} from "lucide-react"
import { Label } from "@/components/ui/label";
import { getMe } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { MeResponse } from "@/types";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<MeResponse | null>(null);
    const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function loadUser() {
      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const data = await getMe();
        setUser(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [router]);
  if (loading) {
    return <div className="p-6">Loading...</div>;
  } 
    return (
        <div className="container mx-auto max-w-3xl space-y-8 p-6">
        <Card>  
            <CardHeader>
                    <User className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                    View and manage your profile
                </CardDescription>
                
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                   
                    

                    <div className="space-y-2">
                        <Label htmlFor="email">
                            Email
                        </Label>

                        <Input
                            id="email"
                            type="email"
                            placeholder="employee@company.com"
                            value={user?.email}
                            disabled
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="firstName">
                            First Name
                        </Label>

                        <Input
                            id="firstName"
                            type="text"
                            placeholder="Mohammed"
                            value={user?.firstName}
                            disabled
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="lastName">
                            Last Name
                        </Label>

                        <Input
                            id="lastName"
                            type="text"
                            placeholder="Fahad"
                            value={user?.lastName}
                            disabled
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">
                            Role
                        </Label>

                        <Input
                            id="role"
                            type="text"
                            placeholder="Admin"
                            value={user?.role}
                            disabled
                        />
                    </div>

                    
                </div>  
            </CardContent>  
            <CardFooter>
            <Button className="w-full"
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            </CardFooter>
        </Card>
        </div>
    );
    }