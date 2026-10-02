import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut, MapPin, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePeakCycle } from "@/lib/peakcycle/store";

export const Route = createFileRoute("/app/perfil")({
  head: () => ({
    meta: [
      { title: "Meu Perfil — PeakCycle" },
      { name: "description", content: "Gerencie seus dados de cliente na plataforma PeakCycle." },
      { property: "og:title", content: "Meu Perfil — PeakCycle" },
      { property: "og:description", content: "Seus dados na plataforma PeakCycle." },
    ],
  }),
  component: ClientProfile,
});

function ClientProfile() {
  const { session, login, logout, reservations } = usePeakCycle();
  const navigate = useNavigate();
  const [name, setName] = useState(session?.name ?? "");

  const mine = reservations.filter((r) => r.clientId === session?.id);

  const save = () => {
    if (name.trim().length < 3) {
      toast.error("Informe um nome com pelo menos 3 caracteres.");
      return;
    }
    login("client", name);
    toast.success("Perfil atualizado.");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="card-soft space-y-4 p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-primary">
            <UserRound className="size-6" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-foreground">{session?.name}</h2>
            <p className="text-sm text-muted-foreground">Cliente / ONG parceira</p>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="profile-name">Nome exibido</Label>
          <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={save}>Salvar alterações</Button>
          <Button
            variant="outline"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => {
              logout();
              navigate({ to: "/" });
              toast.success("Sessão encerrada.");
            }}
          >
            <LogOut className="size-4" /> Sair da conta
          </Button>
        </div>
      </section>

      <section className="card-soft space-y-3 p-5 text-sm">
        <h2 className="text-base font-semibold text-foreground">Resumo da conta</h2>
        <p className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="size-4" /> Localização simulada: São Paulo — SP
        </p>
        <p className="text-muted-foreground">
          Resgates realizados: <strong className="text-foreground">{mine.length}</strong>
        </p>
        <p className="text-muted-foreground">
          Perfil de demonstração: os dados ficam salvos apenas neste navegador.
        </p>
      </section>
    </div>
  );
}
