import { Headset } from "lucide-react";

export function AuthLayout({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
      <aside className="dark hidden flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Headset className="h-5 w-5" />
          </div>
          <span className="font-medium">Help Desk</span>
        </div>

        <h2 className="max-w-md text-4xl font-medium leading-tight tracking-tight">
          Tell IT what's wrong. Follow it until it's fixed.
        </h2>

        <p className="text-sm text-sidebar-foreground/60">
          Tickets, assignments and updates in one place.
        </p>
      </aside>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Headset className="h-5 w-5" />
            </div>
            <span className="font-medium">Help Desk</span>
          </div>

          <div>
            <h1 className="text-2xl font-medium tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {children}

          <p className="text-sm text-muted-foreground">{footer}</p>
        </div>
      </div>
    </main>
  );
}