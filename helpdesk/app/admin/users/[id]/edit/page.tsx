"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  changeUserRole,
  changeUserStatus,
  getUserById,
  updateUser,
} from "@/lib/api";
import { useRequireRole } from "@/hooks/use-require-role";
import {
  Field,
  FormActions,
  FormError,
  FormPage,
} from "@/components/form-page";
import { Segmented } from "@/components/segmented";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserDetails } from "@/types";

type StatusValue = "active" | "inactive";

export default function UpdateUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const { ready } = useRequireRole(["Admin"]);

  const [original, setOriginal] = useState<UserDetails | null>(null);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<StatusValue>("active");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;

    let cancelled = false;

    async function loadUser() {
      try {
        const data = await getUserById(userId);
        if (cancelled) return;

        setOriginal(data);
        setEmail(data.email);
        setFirstName(data.firstName);
        setLastName(data.lastName);
        setRole(data.role);
        setStatus(data.isActive ? "active" : "inactive");
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load user");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [ready, userId]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!original) return;

    setError("");
    setSaving(true);

    const isActive = status === "active";

    try {
      await updateUser(userId, { email, firstName, lastName });

      if (role !== original.role) {
        await changeUserRole(userId, { role });
      }

      if (isActive !== original.isActive) {
        await changeUserStatus(userId, { isActive });
      }

      router.push("/admin/users");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
      setSaving(false);
    }
  }

  if (!ready || loading) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-4 p-4 md:p-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (!original) {
    return (
      <FormPage title="Edit user">
        <FormError message={error || "User not found."} />
      </FormPage>
    );
  }

  const roleOptions = [
    ...(original.role === "Admin"
      ? [{ value: "Admin", label: "Admin" }]
      : []),
    { value: "Technician", label: "Technician" },
    { value: "Employee", label: "Employee" },
  ];

  return (
    <FormPage
      title="Edit user"
      description={`${original.firstName} ${original.lastName}`}
    >
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="First name" htmlFor="firstName">
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </Field>

          <Field label="Last name" htmlFor="lastName">
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </Field>
        </div>

        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>

        <Field label="Role">
          <Segmented
            label="Role"
            value={role}
            onChange={setRole}
            options={roleOptions}
          />
        </Field>

        <Field
          label="Status"
          hint="Inactive users can't sign in and can't be assigned tickets."
        >
          <Segmented
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
        </Field>

        <FormError message={error} />

        <FormActions>
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </FormActions>
      </form>
    </FormPage>
  );
}