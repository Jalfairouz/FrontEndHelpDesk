"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User } from "lucide-react";

import { getMe } from "@/lib/api";
import { useRequireRole } from "@/hooks/use-require-role";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MeResponse } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const { ready } = useRequireRole();

  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;

    let cancelled = false;

    getMe()
      .then((data) => {
        if (!cancelled) setUser(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load profile");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [ready]);

  if (!ready || loading) {
    return <div className="p-6">Loading...</div>;
  }

  const fields = [
    { id: "email", label: "Email", value: user?.email },
    { id: "firstName", label: "First Name", value: user?.firstName },
    { id: "lastName", label: "Last Name", value: user?.lastName },
    { id: "role", label: "Role", value: user?.role },
  ];

  return (
    <div className="container mx-auto max-w-3xl space-y-8 p-6">
      <Card>
        <CardHeader>
          <User className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Profile</CardTitle>
          <CardDescription>View your profile</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {fields.map((field) => (
              <div className="space-y-2" key={field.id}>
                <Label htmlFor={field.id}>{field.label}</Label>
                <Input id={field.id} value={field.value ?? ""} disabled />
              </div>
            ))}
          </div>
        </CardContent>

        <CardFooter>
          <Button
            className="w-full"
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