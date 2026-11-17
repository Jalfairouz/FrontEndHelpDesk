"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createTicket } from "@/lib/api";
import { useRequireRole } from "@/hooks/use-require-role";
import { FormPage } from "@/components/form-page";
import { TicketForm, type TicketFormValues } from "@/components/ticket-form";

export default function CreateTicketPage() {
  const router = useRouter();
  const { ready } = useRequireRole(["Employee", "Admin"]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(values: TicketFormValues) {
    setSaving(true);
    setError("");

    try {
      const data = await createTicket(values);
      router.push(`/tickets/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ticket");
      setSaving(false);
    }
  }

  if (!ready) {
    return <div className="p-6 text-muted-foreground">Loading...</div>;
  }

  return (
    <FormPage
      title="New ticket"
      description="Tell IT what's wrong and we'll route it to the right person."
    >
      <TicketForm
        submitLabel="Create ticket"
        savingLabel="Creating..."
        saving={saving}
        error={error}
        onSubmit={handleSubmit}
      />
    </FormPage>
  );
}