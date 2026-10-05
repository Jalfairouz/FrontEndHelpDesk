"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createUser } from "@/lib/api";
import type { CreateUserInput, UserRole } from "@/types";

export default function CreateUserPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("Technician");
 
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
        const data = await createUser({
        email,
        password,
        firstName,
        lastName,
        role,
      });


      router.push("/admin/users");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create user"
      );
    } finally {
      setLoading(false);
    }
  } 
    return (
        <div className="container mx-auto max-w-3xl p-6">
        <Card>
            <CardHeader>
                <CardTitle>Create User</CardTitle>

                <CardDescription>
                    Create a new user
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">
                            Email
                        </Label>

                        <Input
                            id="email"
                            type="email"
                            placeholder="employee@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <Label htmlFor="password">
                            Password
                        </Label>

                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {/* First Name */}
                    <div className="space-y-2">
                        <Label htmlFor="firstName">
                            First Name
                        </Label>

                        <Input
                            id="firstName"
                            type="text"
                            placeholder="Mohammed"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                        <Label htmlFor="lastName">
                            Last Name
                        </Label>

                        <Input
                            id="lastName"
                            type="text"
                            placeholder="Fahad"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                        <Label htmlFor="role">
                            Role
                        </Label>

                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value as UserRole)}
                            className="w-full rounded-md border px-3 py-2"
                        >
                            <option value="Technician">Technician</option>
                            <option value="Employee">Employee</option>
                        </select>
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
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating..."
                                : "Create User"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    </div>
    );
}
