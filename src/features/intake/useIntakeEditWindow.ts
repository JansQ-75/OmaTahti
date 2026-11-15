import { useEffect, useState } from "react";
import type { Intake } from "@/types";
import { canEditIntake, intakeEditDeadline } from "./intakeEditLogic";

export function useIntakeEditWindow(intake?: Intake): boolean {
  const [now, setNow] = useState(() => Date.now());
  const deadline = intakeEditDeadline(intake);
  useEffect(() => {
    const refresh = () => setNow(Date.now());
    refresh();
    const timer = deadline !== null && deadline > Date.now()
      ? window.setTimeout(refresh, deadline - Date.now()) : undefined;
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [deadline]);
  // A just-saved intake may be newer than this hook's last render clock.
  return canEditIntake(intake, Math.max(now, Date.now()));
}