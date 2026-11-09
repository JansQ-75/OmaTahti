import { createFileRoute } from "@tanstack/react-router";
import { Home, MessageCircle, Users } from "lucide-react";
import { RoleLayout, type NavItem } from "@/layouts/RoleLayout";

const items: NavItem[] = [
  { to: "/fysioterapeutti", label: "Etusivu", icon: Home, exact: true },
  { to: "/fysioterapeutti/asiakkaat", label: "Asiakkaat", icon: Users },
  { to: "/fysioterapeutti/viestit", label: "Viestit", icon: MessageCircle },
];

export const Route = createFileRoute("/fysioterapeutti")({
  component: PhysioShell,
});

function PhysioShell() {
  return <RoleLayout role="physio" items={items} roleLabel="Fysioterapeutti" />;
}
