"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Home() {
    const router = useRouter();

    return (

        <main className="flex min-h-screen flex-col items-center justify-center gap-6">
            <h1 className="text-center text-3xl font-bold">
                Help Desk System
            </h1>

            <p className="text-muted-foreground">
                A simple way to request, track, and resolve IT support issues.
            </p>

            <div className="flex gap-6">
                <Button onClick={() => router.push("/login")}>
                    Login
                </Button>

                <Button variant="outline" onClick={() => router.push("/register")}>
                    Register
                </Button>
            </div>
        </main>
    );
}
