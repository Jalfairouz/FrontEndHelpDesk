"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api";
import { useState } from "react";
import { saveToken } from "@/lib/auth";
export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  setError("");
  setLoading(true);

  try {
    const data = await loginUser(email, password);

    saveToken(data.accessToken);
    router.push("/dashboard");
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}
    return (
        <main className="flex min-h-screen items-center justify-center gap-6 bg-muted/40 p-6">
            <div className="flex flex-col justify-center gap-8">
            <h1 className="text-4xl font-bold">
                Help Desk System
            </h1>
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">
                        Welcome Back
                    </CardTitle>
                    <CardDescription>
                        Sign in to access your IT support account.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input 
                                    id="email"
                                    type="email"
                                    placeholder="employee@company.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    value={password}                                   
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-red-500 font-medium">{error}</p>
                            )}

                            <Button 
                                type="submit"
                                disabled={loading}
                                className="w-full"
                            >
                                {loading ? "Signing in..." : "Login"}
                            </Button>
                           <Button
                            type="button"
                            className="w-full bg-transparent text-blue-600 hover:bg-blue-50"
                            onClick={() => router.push("/register")}
                            >
                            Register
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
            </div>
        </main>
    );
}