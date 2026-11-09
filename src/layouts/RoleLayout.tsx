import { Link, Navigate, Outlet } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { ResetDemoButton } from "@/components/navigation/RoleActions";
import { useAppData, useRole } from "@/hooks/useAppData";
import type { Role } from "@/types";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

/**
 * Shared shell for both roles: sidebar on desktop, bottom bar on mobile.
 * Guards the section so a user never lands in the other role's views.
 */
export function RoleLayout({ role, items, roleLabel }: { role: Role; items: NavItem[]; roleLabel: string }) {
  const currentRole = useRole();
  const data = useAppData();

  if (currentRole === undefined || !data) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Ladataan…</div>;
  }
  if (currentRole !== role) return <Navigate to="/" />;

  const linkCls =
    "flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent";
  const activeCls = "bg-sidebar-accent text-sidebar-accent-foreground";

  return (
    <div className="min-h-screen md:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-5 md:flex">
        <Logo />
        <p className="mt-1 pl-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{roleLabel}</p>
        <nav className="mt-8 flex flex-col gap-1" aria-label="Päävalikko">
          {items.map((it) => (
            <Link
              key={it.to}
              to={it.to}
              activeOptions={{ exact: it.exact }}
              className={linkCls}
              activeProps={{ className: activeCls, "aria-current": "page" }}
            >
              <it.icon className="h-5 w-5" /> {it.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          <ResetDemoButton className="w-full justify-start" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:hidden">
          <Logo />
          <span className="text-xs font-medium text-muted-foreground">{roleLabel}</span>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-6 md:px-10 md:pb-12 md:pt-10">
          <Outlet />
        </main>
      </div>

      <nav
        aria-label="Päävalikko"
        className="fixed inset-x-0 bottom-0 z-40 grid border-t border-border bg-card/95 backdrop-blur md:hidden"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((it) => (
          <Link
            key={it.to}
            to={it.to}
            activeOptions={{ exact: it.exact }}
            className="flex flex-col items-center gap-1 py-2.5 text-xs font-medium text-muted-foreground"
            activeProps={{ className: "text-primary", "aria-current": "page" }}
          >
            <it.icon className="h-6 w-6" />
            {it.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
