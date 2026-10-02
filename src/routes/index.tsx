import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Heart, Leaf, ShoppingBasket, Store, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/peakcycle/Logo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import heroImage from "@/assets/hero-peakcycle.jpg";
import { usePeakCycle } from "@/lib/peakcycle/store";
import type { Role } from "@/lib/peakcycle/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PeakCycle — Alimentos que transformam. Oportunidades que alimentam." },
      {
        name: "description",
        content:
          "Entre como cliente ou como loja e participe da rede PeakCycle de combate ao desperdício alimentar.",
      },
      { property: "og:title", content: "PeakCycle — Combate ao desperdício alimentar" },
      {
        property: "og:description",
        content:
          "Lojas doam ou vendem a preço simbólico alimentos próximos da validade. Comunidade e ONGs resgatam.",
      },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  const navigate = useNavigate();
  const { session, login, hydrated } = usePeakCycle();
  const [signupRole, setSignupRole] = useState<Role | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    if (!hydrated || !session) return;
    navigate({ to: session.role === "admin" ? "/admin" : "/app" });
  }, [hydrated, session, navigate]);

  const enter = (role: Role, customName?: string) => {
    login(role, customName);
    toast.success(role === "admin" ? "Bem-vindo, loja parceira!" : "Bom resgate!");
    navigate({ to: role === "admin" ? "/admin" : "/app" });
  };

  const submitSignup = () => {
    if (!signupRole) return;
    if (name.trim().length < 3) {
      toast.error("Informe um nome com pelo menos 3 caracteres.");
      return;
    }
    enter(signupRole, name);
    setSignupRole(null);
    setName("");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <Logo />
          <h1 className="mt-8 text-4xl leading-tight font-extrabold text-foreground sm:text-5xl">
            Alimentos que transformam.{" "}
            <span className="text-primary">Oportunidades que alimentam.</span>
          </h1>
          <p className="mt-4 max-w-lg text-base text-muted-foreground">
            O PeakCycle conecta supermercados, padarias e mercearias a pessoas da comunidade e ONGs.
            Alimentos próximos da validade viram doação ou venda a preço simbólico — menos
            desperdício, mais pratos cheios.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="flex-1" onClick={() => enter("client")}>
              <ShoppingBasket className="size-4" /> Entrar como Cliente
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1"
              onClick={() => enter("admin")}
            >
              <Store className="size-4" /> Entrar como Loja
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <button
              type="button"
              className="font-semibold text-primary underline-offset-4 hover:underline"
              onClick={() => setSignupRole("client")}
            >
              Criar conta de cliente
            </button>
            <span className="text-muted-foreground">·</span>
            <button
              type="button"
              className="font-semibold text-primary underline-offset-4 hover:underline"
              onClick={() => setSignupRole("admin")}
            >
              Cadastrar minha loja
            </button>
          </div>

          <dl className="mt-10 grid grid-cols-3 gap-3 text-center">
            {[
              { icon: Leaf, value: "ODS 2", label: "Fome Zero" },
              { icon: Users, value: "2 perfis", label: "Loja e comunidade" },
              { icon: Heart, value: "100%", label: "Impacto local" },
            ].map((item) => (
              <div key={item.label} className="card-soft px-3 py-4">
                <item.icon className="mx-auto size-5 text-primary" />
                <dt className="mt-2 font-display text-lg font-bold">{item.value}</dt>
                <dd className="text-xs text-muted-foreground">{item.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <img
            src={heroImage}
            alt="Caixas de alimentos resgatados em um mercado de bairro"
            width={1280}
            height={960}
            className="w-full rounded-3xl object-cover shadow-lift"
          />
          <div className="card-soft absolute -bottom-5 left-4 right-4 p-4 sm:left-8 sm:right-auto sm:max-w-xs">
            <p className="text-sm font-semibold text-foreground">
              "Boas escolhas alimentam pessoas e preservam o planeta."
            </p>
          </div>
        </div>
      </div>

      <Dialog open={signupRole !== null} onOpenChange={(o) => !o && setSignupRole(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {signupRole === "admin" ? "Cadastrar minha loja" : "Criar conta de cliente"}
            </DialogTitle>
            <DialogDescription>
              Cadastro simulado para a demonstração: nenhum dado é enviado a servidores.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="signup-name">
              {signupRole === "admin" ? "Nome do estabelecimento" : "Seu nome ou da sua ONG"}
            </Label>
            <Input
              id="signup-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={signupRole === "admin" ? "Mercado Boa Colheita" : "Ana Souza"}
              onKeyDown={(e) => e.key === "Enter" && submitSignup()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSignupRole(null)}>
              Cancelar
            </Button>
            <Button onClick={submitSignup}>Criar e entrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
