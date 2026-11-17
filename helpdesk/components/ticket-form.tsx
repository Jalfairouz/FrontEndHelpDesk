"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Field, FormActions, FormError } from "@/components/form-page";
import { Segmented } from "@/components/segmented";
import { PriorityMark } from "@/components/status-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { TicketCategory, TicketPriority, TicketType } from "@/types";

export interface TicketFormValues {
  title: string;
  description: string;
  type: TicketType;
  category: TicketCategory;
  priority: TicketPriority;
}

const CATEGORIES: TicketCategory[] = [
  "Hardware",
  "Software",
  "Network",
  "Access",
  "Email",
  "Security",
  "Other",
];

const EMPTY: TicketFormValues = {
  title: "",
  description: "",
  type: "Incident",
  category: "Hardware",
  priority: "Low",
};

interface Props {
  initial?: TicketFormValues;
  submitLabel: string;
  savingLabel: string;
  saving: boolean;
  error: string;
  onSubmit: (values: TicketFormValues) => void;
}

export function TicketForm({
  initial = EMPTY,
  submitLabel,
  savingLabel,
  saving,
  error,
  onSubmit,
}: Props) {
  const router = useRouter();
  const [values, setValues] = useState<TicketFormValues>(initial);

  const set = <K extends keyof TicketFormValues>(
    key: K,
    value: TicketFormValues[K]
  ) => setValues((prev) => ({ ...prev, [key]: value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          ...values,
          title: values.title.trim(),
          description: values.description.trim(),
        });
      }}
      className="space-y-6"
    >
      <Field label="Title" htmlFor="title">
        <Input
          id="title"
          dir="auto"
          placeholder="Short summary of the problem"
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
          required
        />
      </Field>

      <Field
        label="Description"
        htmlFor="description"
        hint="What happened, and what did you expect?"
      >
        <Textarea
          id="description"
          dir="auto"
          rows={6}
          placeholder="Describe the problem..."
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          required
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Type">
          <Segmented
            label="Type"
            value={values.type}
            onChange={(v) => set("type", v)}
            options={[
              { value: "Incident", label: "Incident" },
              { value: "ServiceRequest", label: "Service request" },
            ]}
          />
        </Field>

        <Field label="Category">
          <Select
            value={values.category}
            onValueChange={(v) => v && set("category", v as TicketCategory)}
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="Priority">
        <Segmented
          label="Priority"
          value={values.priority}
          onChange={(v) => set("priority", v)}
          options={(["Low", "Medium", "High"] as const).map((p) => ({
            value: p,
            label: <PriorityMark priority={p} />,
          }))}
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
          {saving ? savingLabel : submitLabel}
        </Button>
      </FormActions>
    </form>
  );
}