"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

import { getLogs } from "@/lib/api";
import { useRequireRole } from "@/hooks/use-require-role";
import { formatDateShort } from "@/lib/ticket-ui";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { LogsPage } from "@/types";

const PAGE_SIZE = 50;
const MAX_WINDOW = 10_000;

function statusDot(status: number | null): string {
  if (status === null) return "border-2 border-muted-foreground/60";
  if (status >= 500) return "bg-destructive";
  if (status >= 400) return "border-2 border-destructive";
  if (status >= 300) return "bg-muted-foreground/60";
  return "bg-chart-2";
}

export default function AdminLogsPage() {
  const { ready } = useRequireRole(["Admin"]);

  const [data, setData] = useState<LogsPage | null>(null);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;

    let cancelled = false;

    async function loadLogs() {
      setLoading(true);
      setError("");

      try {
        const result = await getLogs(page, PAGE_SIZE);
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load logs");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadLogs();

    return () => {
      cancelled = true;
    };
  }, [ready, page, reloadKey]);

  if (!ready) {
    return <div className="p-6 text-muted-foreground">Loading...</div>;
  }

  const total = data?.total ?? 0;
  const totalPages = Math.max(
    1,
    Math.min(Math.ceil(total / PAGE_SIZE), MAX_WINDOW / PAGE_SIZE)
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">API logs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data
              ? `${total.toLocaleString()} request${total === 1 ? "" : "s"}, newest first`
              : "Loading logs..."}
          </p>
        </div>

        <Button
          variant="outline"
          disabled={loading}
          onClick={() => setReloadKey((k) => k + 1)}
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {!data ? (
        <Skeleton className="h-96 w-full" />
      ) : data.items.length === 0 ? (
        <div className="rounded-lg border border-dashed py-14 text-center text-sm text-muted-foreground">
          No requests have been logged yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card text-card-foreground">
          <Table>
            <TableHeader>
              <TableRow className="border-b hover:bg-transparent">
                <TableHead className="w-44 pl-4">Time</TableHead>
                <TableHead>Request</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-28">Duration</TableHead>
                <TableHead className="w-40">User</TableHead>
                <TableHead className="w-28 pr-4">Service</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.items.map((log) => (
                <TableRow key={log.correlationId}>
                  <TableCell className="whitespace-nowrap pl-4 text-xs text-muted-foreground tabular-nums">
                    {formatDateShort(log.timestamp)}
                  </TableCell>

                  <TableCell className="max-w-md">
                    <p className="break-all font-mono text-xs">
                      <span className="mr-2 text-muted-foreground">
                        {log.method ?? "-"}
                      </span>
                      {log.path ?? "-"}
                      {log.query ? `?${log.query}` : ""}
                    </p>
                    {log.error && (
                      <p className="mt-0.5 text-xs text-destructive">
                        {log.error}
                      </p>
                    )}
                  </TableCell>

                  <TableCell>
                    <span className="inline-flex items-center gap-2 text-sm tabular-nums">
                      <span
                        className={cn(
                          "h-2.5 w-2.5 shrink-0 rounded-full",
                          statusDot(log.statusCode)
                        )}
                      />
                      {log.statusCode ?? "..."}
                    </span>
                  </TableCell>

                  <TableCell
                    className={cn(
                      "whitespace-nowrap text-xs tabular-nums",
                      (log.durationMs ?? 0) > 1000
                        ? "text-destructive"
                        : "text-muted-foreground"
                    )}
                  >
                    {log.durationMs !== null ? `${log.durationMs} ms` : "-"}
                  </TableCell>

                  <TableCell className="text-xs" title={log.userId ?? ""}>
                    {log.role ?? "-"}
                    {log.userId && (
                      <span className="ml-1 text-muted-foreground tabular-nums">
                        {log.userId.slice(0, 8)}
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="pr-4 text-xs">
                    {log.service?.replace("-cluster", "") ?? "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          disabled={loading || page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </Button>

        <span className="text-sm text-muted-foreground tabular-nums">
          Page {page} of {totalPages}
        </span>

        <Button
          variant="outline"
          disabled={loading || page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}