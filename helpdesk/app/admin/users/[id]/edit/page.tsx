"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import { getUserById, updateUser, changeUserRole, changeUserStatus } from "@/lib/api";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {  User } from "lucide-react";

import type {  UserDetails, UserRole } from "@/types";
export default function UpdateUserPage() {
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;

const [user, setUser] = useState<UserDetails | null>(null);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUsers() {
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
      if (getRole(decoded) !== "Admin") {
        router.replace("/dashboard");
        return;
      }

      try {
        const userData = await getUserById(userId);
        setUser(userData);
         setEmail(userData.email);
        setFirstName(userData.firstName);
        setLastName(userData.lastName);
        setRole(userData.role);
        setIsActive(userData.isActive);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load users"
        );
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [router]);
 const handleSave = async () => {
  setError("");
  setLoading(true);

  try {
    await updateUser(userId, {
      email,
      firstName,
      lastName,
    });

    await changeUserRole(userId, {
      role,
    });

    await changeUserStatus(userId, {
      isActive,
    });

    router.push("/admin/users");
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Failed to update user"
    );
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        {error}
      </div>
    );
  }

  return (
        <div className=" flex-col gap-6 p-6">
            <form onSubmit={ handleSave}>
        <Card>
            <div className="flex flex-col gap-6 p-6">


            <CardHeader>
          <CardTitle>Edit User Information</CardTitle>

         
        </CardHeader>
        
      

        <CardContent>
        <div className="space-y-4">
            
            <Label htmlFor="email">
                Email
            </Label>
            <Input
                id="email"
                type="email"
                value={email}
                
                onChange={(e) => setEmail(e.target.value)}
            />
            
            <label htmlFor="firstName">First Name</label>
            <Input
                id="firstName"
                type="text"
                placeholder="Mohammed"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
            />
            <label htmlFor="lastName">Last Name</label>
            <Input
                id="lastName"
                type="text"
                placeholder="Fahad"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
            />
            
        </div>
        </CardContent>

        
      
      
        <CardHeader className="flex flex-col gap-6 p-6">
          <CardDescription>Change Role</CardDescription>

          
        </CardHeader>
        <CardContent>
            <Label htmlFor="role">Role</Label>

                <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full rounded-md border px-3 py-2"
                >
                
                <option value="Technician">Technician</option>
                <option value="Employee">Employee</option>
                </select>


        </CardContent>

        
      
      
        <CardHeader className="flex flex-col gap-6 p-6">
          <CardDescription>Change User Status</CardDescription>

          
        </CardHeader>
        <CardContent>
            <label htmlFor="isActive">Status</label>

            <select 
                id="isActive"
                value={isActive ? "true" : "false"}
                onChange={(e) => setIsActive(e.target.value === "true")}
                className="w-full rounded-md border px-3 py-2"
            >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
            </select>
            </CardContent>
        
        
      
       
      
              
      
      </div>
        </Card>
        <Button
                className="w-full gap-2"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Updating..."
                  : "Update"}
              </Button>
        <Button
                className="w-full"
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button> 
      </form>
    </div>

  );
};
