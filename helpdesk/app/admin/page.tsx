"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getUsers } from "@/lib/api";
import { getToken , getRole, decodeToken} from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge, User } from "lucide-react";

import type {  UserDetails } from "@/types";
export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserDetails[]>([]);
  const[ tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = getToken();
  const decoded = token ? decodeToken(token) : null;

  useEffect(() => {
  async function loadData() {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const [usersData] = await Promise.all([
        getUsers(),
  
      ]);

      setUsers(usersData);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  loadData();
}, [router]);

if (loading) {
  return <div className="p-6">Loading...</div>;
}
return (
    <div className="p-6">
    {decoded &&
    ["Admin", "Technician"].includes(getRole(decoded) ?? "") && (
    <div className="space-y-4 gap-4">
      <Card >
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                
              </div>
              <Button
                variant="outline"
                onClick={() => router.push("/admin/users")}
              >
                Create User
              </Button>
            </div>
            <div className="w-full  ">
              {users.map((user) => (
                <div className=" rounded-lg  p-2 space-y-4" >
                <Card key={user.id} className="relative gap-4">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{user.firstName} {user.lastName}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <Badge
                            className={
                            user.isActive
                                ? " rounded-full bg-green-400 text-green-400 "
                                : "rounded-full bg-red-100 text-red-100 "
                            }
                        >
                            {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                        </div>
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {user.role}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                  </CardContent>
                  <CardFooter className="gap-4 p-4">
                    <Button
                    className="flex-5"
                      variant="outline"
                      onClick={() => router.push(`/admin/users/${user.id}`)}
                    >
                      View
                    </Button>
                    <Button
                    className="flex-2"
                      variant="outline"
                      onClick={() => router.push(`/admin/users/${user.id}/edit`)}
                    >
                      Edit
                    </Button>
                  </CardFooter>
                </Card>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>  

)}

</div>
);}