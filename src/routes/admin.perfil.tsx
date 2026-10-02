import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut, RotateCcw, Store } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePeakCycle } from "@/lib/peakcycle/store";

export const Route = createFileRoute("/admin/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil da Loja — PeakCycle" },
      { name: "description", content: "Dados do estabelecimento parceiro PeakCycle." },
      { property: "og:title", content: "Perfil da Loja — PeakCycle" },
      { property: "og:description", content: "Dados do estabelecimento parceiro." },
    ],
  }),
  component: AdminProfile,
});

function AdminProfile() {
  const { session, login, logout, resetDemoData } = usePeakCycle();
  const navigate = useNavigate();
  const [name, setName] = useState(session?.storeName ?? session?.name ?? "");

  const save = () => {
    if (name.trim().length < 3) {
      toast.error("Informe um nome com pelo menos 3 caracteres.");
      return;
    }
    login("admin", name);
    toast.success("Perfil atualizado.");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="card-soft space-y-4 p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-primary"><Store className="size-6" /></span>
          <div>
            <h2 className="text-base font-semibold text-foreground">{session?.storeName ?? session?.name}</h2>
            <p className="text-sm text-muted-foreground">Loja parceira</p>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="store-name">Nome de exibição</Label>
          <Input id="store-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={save}>Salvar alterações</Button>
          <Button variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => { logout(); navigate({ to: "/" }); toast.success("Sessão encerrada."); }}>
            <LogOut className="size-4" /> Sair
          </Button>
        </div>
      </section>

      <section className="card-soft space-y-3 p-5 text-sm">
        <h2 className="text-base font-semibold text-foreground">Dados de demonstração</h2>
        <p className="text-muted-foreground">Restaura os produtos e reservas iniciais. Útil antes de uma apresentação.</p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline"><RotateCcw className="size-4" /> Restaurar dados iniciais</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Restaurar dados iniciais?</AlertDialogTitle>
              <AlertDialogDescription>Todos os produtos e reservas atuais serão substituídos pelos exemplos.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => { resetDemoData(); toast.success("Dados de demonstração restaurados."); }}>Restaurar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  );
}
