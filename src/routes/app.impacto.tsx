import { Link, createFileRoute } from "@tanstack/react-router";
import { Leaf, PiggyBank, Sprout, Utensils } from "lucide-react";
import { useMemo } from "react";
import { EmptyState } from "@/components/peakcycle/EmptyState";
import { Button } from "@/components/ui/button";
import { brl } from "@/lib/peakcycle/format";
import { usePeakCycle } from "@/lib/peakcycle/store";

export const Route = createFileRoute("/app/impacto")({
  head: () => ({
    meta: [
      { title: "Meu Impacto — PeakCycle" },
      { name: "description", content: "Veja quantos alimentos você ajudou a salvar do desperdício." },
      { property: "og:title", content: "Meu Impacto — PeakCycle" },
      { property: "og:description", content: "Seu impacto social na rede PeakCycle." },
    ],
  }),
  component: ImpactPage,
});

function ImpactPage() {
  const { reservations, session } = usePeakCycle();

  const stats = useMemo(() => {
    const mine = reservations.filter((r) => r.clientId === session?.id && r.status !== "cancelada");
    const items = mine.reduce((s, r) => s + r.quantity, 0);
    const donated = mine.filter((r) => r.unitPrice === 0).reduce((s, r) => s + r.quantity, 0);
    const spent = mine.reduce((s, r) => s + r.total, 0);
    return { total: mine.length, items, donated, spent };
  }, [reservations, session]);

  if (stats.total === 0) {
    return (
      <EmptyState
        icon={Sprout}
        title="Seu impacto começa no primeiro resgate"
        description="Reserve um alimento próximo da validade e acompanhe aqui tudo o que você ajudou a salvar."
        action={
          <Button asChild>
            <Link to="/app">Explorar alimentos</Link>
          </Button>
        }
      />
    );
  }

  const cards = [
    { icon: Utensils, label: "Alimentos resgatados", value: `${stats.items}` },
    { icon: Leaf, label: "Itens recebidos por doação", value: `${stats.donated}` },
    { icon: Sprout, label: "Resgates realizados", value: `${stats.total}` },
    { icon: PiggyBank, label: "Investido em preço simbólico", value: brl(stats.spent) },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card-soft p-5">
            <c.icon className="size-5 text-primary" />
            <p className="mt-3 font-display text-2xl font-bold text-foreground">{c.value}</p>
            <p className="text-sm text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="card-soft bg-secondary p-6">
        <h2 className="font-display text-lg font-bold text-foreground">
          Cada resgate é um prato que não virou lixo
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-secondary-foreground">
          Seus {stats.items} itens resgatados contribuem diretamente para o ODS 2 — Fome Zero,
          reduzindo o desperdício alimentar e ampliando o acesso à comida de qualidade na sua
          comunidade.
        </p>
      </div>
    </div>
  );
}
