import { useNavigate } from "@tanstack/react-router";
import { RefreshCcw, Repeat } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { resetDemoData, setActiveClient, setRole } from "@/services/storage";
import { useAppData } from "@/hooks/useAppData";

export function SwitchRoleButton({ className }: { className?: string }) {
  const navigate = useNavigate();
  return (
    <Button
      variant="outline"
      className={className}
      onClick={() => {
        setRole(null);
        navigate({ to: "/" });
      }}
    >
      <Repeat className="h-4 w-4" /> Vaihda roolia
    </Button>
  );
}

export function ResetDemoButton({ className }: { className?: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className={className}>
          <RefreshCcw className="h-4 w-4" /> Palauta demodata
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Palautetaanko demodata?</AlertDialogTitle>
          <AlertDialogDescription>
            Kaikki demon aikana tehdyt muutokset poistetaan: harjoitukset, kipukirjaukset, viestit, ilmoitukset ja
            liikemittaukset palautetaan alkutilaan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Peruuta</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              resetDemoData();
              toast.success("Demodata palautettu alkutilaan");
            }}
          >
            Palauta
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Demo helper: switch between the demo clients without leaving the client role. */
export function SwitchClientButton({ className }: { className?: string }) {
  const data = useAppData();
  const navigate = useNavigate();
  if (!data) return null;
  const other = data.clients.find((c) => c.id !== data.activeClientId);
  if (!other) return null;
  return (
    <Button
      variant="outline"
      className={className}
      onClick={() => {
        setActiveClient(other.id);
        navigate({ to: "/asiakas" });
        toast.success(`Vaihdettu asiakkaaksi ${other.name}`);
      }}
    >
      <Repeat className="h-4 w-4" /> Vaihda asiakkaaksi {other.firstName}
    </Button>
  );
}
