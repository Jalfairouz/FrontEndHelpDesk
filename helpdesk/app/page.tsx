import Link from "next/link";
import { Headset } from "lucide-react";

import { PriorityMark, StatusMark } from "@/components/status-mark";
import { buttonVariants } from "@/components/ui/button";

const EXAMPLE_TICKETS = [
  { title: "Laptop won't connect to Wi-Fi", status: "Open", priority: "High" },
  {
    title: "Request for a second monitor",
    status: "InProgress",
    priority: "Medium",
  },
  { title: "Reset my email password", status: "Closed", priority: "Low" },
  { title: "VPN drops every few minutes", status: "InProgress", priority: "High" },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Headset className="h-5 w-5" />
          </div>
          <span className="font-medium">Help Desk</span>
        </div>

        <nav className="flex items-center gap-2">
          <Link
            href="/login"
            className={buttonVariants({ variant: "ghost" })}
          >
            Sign in
          </Link>
          <Link href="/register" className={buttonVariants()}>
            Create account
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-6 pb-16 pt-8 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-6">
          <h1 className="text-4xl font-medium leading-tight tracking-tight md:text-5xl">
            Tell IT what's wrong. Follow it until it's fixed.
          </h1>

          <p className="max-w-md text-base leading-7 text-muted-foreground">
            Open a ticket, see who is handling it, and get notified the moment
            it moves.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className={buttonVariants({ size: "lg" })}
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Create account
            </Link>
          </div>
        </div>

        <div className="dark overflow-hidden rounded-lg bg-card text-card-foreground">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <span className="text-sm">Your tickets</span>
            <span className="text-xs text-muted-foreground">Example</span>
          </div>

          <ul className="divide-y">
            {EXAMPLE_TICKETS.map((ticket) => (
              <li
                key={ticket.title}
                className="flex items-center justify-between gap-4 px-4 py-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm">{ticket.title}</p>
                  <div className="mt-1.5">
                    <StatusMark status={ticket.status} />
                  </div>
                </div>

                <PriorityMark priority={ticket.priority} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}