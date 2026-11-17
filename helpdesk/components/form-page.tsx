"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Label } from "@/components/ui/label";

export function FormPage({
  title,
  description,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 p-4 md:p-8">
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div>
          <h1 className="text-2xl font-medium tracking-tight">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
    >
      {message}
    </div>
  );
}

export function FormActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end gap-3 border-t pt-6">{children}</div>
  );
}