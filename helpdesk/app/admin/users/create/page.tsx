"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createUser } from "@/lib/api";
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

type NewRole = "Technician" | "Employee";

export default function CreateUserPage() {
  const router = useRouter();
  const { ready } = useRequireRole(["Admin"]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<NewRole>("Technician");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSaving(true);

    try {
      await createUser({ email, password, firstName, lastName, role });
      router.push("/admin/users");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
      setSaving(false);
    }
  }

  if (!ready) {
    return <div className="p-6 text-muted-foreground">Loading...</div>;
  }

  return (
    <FormPage
      title="New user"
      description="Create an account for a technician or an employee."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
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
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>

        <Field
          label="Password"
          htmlFor="password"
          hint="The user can use this to sign in right away."
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>

        <Field label="Role">
          <Segmented
            label="Role"
            value={role}
            onChange={setRole}
            options={[
              { value: "Technician", label: "Technician" },
              { value: "Employee", label: "Employee" },
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
            {saving ? "Creating..." : "Create user"}
          </Button>
        </FormActions>
      </form>
    </FormPage>
  );
}