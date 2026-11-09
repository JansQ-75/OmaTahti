import { createFileRoute } from "@tanstack/react-router";
import { ChartLine, ClipboardList, Home, MessageCircle } from "lucide-react";
import { RoleLayout, type NavItem } from "@/layouts/RoleLayout";

const items: NavItem[] = [
  { to: "/asiakas", label: "Etusivu", icon: Home, exact: true },
  { to: "/asiakas/harjoitukset", label: "Harjoitukset", icon: ClipboardList },
  { to: "/asiakas/edistyminen", label: "Edistyminen", icon: ChartLine },
  { to: "/asiakas/viestit", label: "Viestit", icon: MessageCircle },
];

export const Route = createFileRoute("/asiakas")({
  component: ClientShell,
});

function ClientShell() {
  return <RoleLayout role="client" items={items} roleLabel="Asiakas" />;
}
