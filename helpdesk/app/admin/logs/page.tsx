"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

import { getLogs } from "@/lib/api";
import { useRequireRole } from "@/hooks/use-require-role";
import { formatDate } from "@/lib/ticket-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LogsPage } from "@/types";

const PAGE_SIZE = 50;
const MAX_WINDOW = 10_000;

function statusClass(status: number | null): string {
  if (status === null) return "bg-gray-100 text-gray-700 hover:bg-gray-100";
  if (status >= 500) return "bg-red-100 text-red-700 hover:bg-red-100";
  if (status >= 400) return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
  if (status >= 300) return "bg-blue-100 text-blue-700 hover:bg-blue-100";
  return "bg-green-100 text-green-700 hover:bg-green-100";
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
    return <div className="p-6">Loading...</div>;
  }

  const total = data?.total ?? 0;
  const totalPages = Math.max(
    1,
    Math.min(Math.ceil(total / PAGE_SIZE), MAX_WINDOW / PAGE_SIZE)
  );

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Logs</h1>
          <p className="mt-2 text-muted-foreground">
            Every request that goes through the gateway, newest first
          </p>
        </div>

        <Button
          variant="outline"
          disabled={loading}
          onClick={() => setReloadKey((k) => k + 1)}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Requests</CardTitle>
          <CardDescription>
            {loading && !data
              ? "Loading logs..."
              : `${total.toLocaleString()} log${total === 1 ? "" : "s"} · page ${page} of ${totalPages}`}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {data && data.items.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              No logs yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Path</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {data?.items.map((log) => (
                    <TableRow key={log.correlationId}>
                      <TableCell className="whitespace-nowrap text-xs">
                        {formatDate(log.timestamp)}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline">{log.method ?? "-"}</Badge>
                      </TableCell>

                      <TableCell className="max-w-xs break-all text-xs">
                        {log.path ?? "-"}
                        {log.query ? `?${log.query}` : ""}
                      </TableCell>

                      <TableCell>
                        <Badge className={statusClass(log.statusCode)}>
                          {log.statusCode ?? "pending"}
                        </Badge>
                      </TableCell>

                      <TableCell
                        className={`whitespace-nowrap text-xs ${
                          (log.durationMs ?? 0) > 1000
                            ? "font-semibold text-orange-600"
                            : ""
                        }`}
                      >
                        {log.durationMs !== null ? `${log.durationMs} ms` : "-"}
                      </TableCell>

                      <TableCell className="text-xs" title={log.userId ?? ""}>
                        {log.role ?? "-"}
                        {log.userId ? ` · ${log.userId.slice(0, 8)}` : ""}
                      </TableCell>

                      <TableCell className="text-xs">
                        {log.service?.replace("-cluster", "") ?? "-"}
                      </TableCell>

                      <TableCell className="text-xs text-red-600">
                        {log.error ?? ""}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <Button
              variant="outline"
              disabled={loading || page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              Page {page} / {totalPages}
            </span>

            <Button
              variant="outline"
              disabled={loading || page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}