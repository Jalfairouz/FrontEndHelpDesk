'use client'
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
import { registerUser } from "@/lib/api";
import { useState } from "react";

export default function RegisterPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    async function handleSubmit(e : any) {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const data = await registerUser(email, password, firstName, lastName);
      setSuccess("تم إنشاء الحساب بنجاح! جاري تحويلك لتسجيل الدخول...");
      router.push("/login");
      
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
                        Register
                    </CardTitle>

                    <CardDescription>
                        Sign up for a new account.
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

                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                               
                                id="firstName"
                                type="text"
                                placeholder="Mohammed"
                                required
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                               
                                id="lastName"
                                type="text"
                                placeholder="Fahad"
                                required
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                                {error}
                            </div>
                        )}
                        <Button type="submit"
                        disabled={loading}
                        
                         className="w-full" >
                            Register
                        </Button>
                        <Button
                            type="button"
                            className="w-full bg-transparent text-blue-600 hover:bg-blue-50"
                            onClick={() => router.push("/login")}
                            >
                            Login
                            </Button>
                    </div>
                    </form>
                </CardContent>
            </Card>
            </div>
        </main>
    );
}