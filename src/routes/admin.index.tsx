import { Link, createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, HandHeart, Leaf, Package, Boxes } from "lucide-react";
import { useMemo } from "react";
import { ReservationBadge } from "@/components/peakcycle/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/peakcycle/format";
import { usePeakCycle } from "@/lib/peakcycle/store";
import type { ReservationStatus } from "@/lib/peakcycle/types";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

const STATUS_ORDER: ReservationStatus[] = ["pendente", "confirmada", "retirada", "cancelada"];

function Dashboard() {
  const { products, reservations } = usePeakCycle();

  const stats = useMemo(() => {
    const available = products.reduce((s, p) => s + p.quantity, 0);
    const rescued = reservations.filter((r) => r.status === "retirada").reduce((s, r) => s + r.quantity, 0);
    const committed = reservations.filter((r) => r.status !== "cancelada").reduce((s, r) => s + r.quantity, 0);
    const byStatus = STATUS_ORDER.map((s) => ({ status: s, count: reservations.filter((r) => r.status === s).length }));
    return { available, rescued, committed, byStatus };
  }, [products, reservations]);

  const cards = [
    { icon: Package, label: "Produtos cadastrados", value: products.length },
    { icon: Boxes, label: "Itens disponíveis", value: stats.available },
    { icon: CalendarCheck, label: "Reservas recebidas", value: reservations.length },
    { icon: HandHeart, label: "Itens resgatados", value: stats.rescued },
    { icon: Leaf, label: "Alimentos salvos (estimado)", value: stats.committed },
  ];

  const recent = [...reservations].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const max = Math.max(1, ...stats.byStatus.map((s) => s.count));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="card-soft p-4">
            <c.icon className="size-5 text-primary" />
            <p className="mt-3 font-display text-2xl font-bold text-foreground">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="card-soft p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Atividades recentes</h2>
            <Button asChild variant="ghost" size="sm"><Link to="/admin/reservas">Ver todas</Link></Button>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma reserva ainda.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((r) => (
                <li key={r.id} className="flex items-center gap-3 py-3 text-sm">
                  <img src={r.productImage} alt="" loading="lazy" className="size-10 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{r.clientName} reservou {r.quantity} {r.unit} de {r.productName}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(r.createdAt)}</p>
                  </div>
                  <ReservationBadge status={r.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card-soft p-5">
          <h2 className="mb-4 text-base font-semibold text-foreground">Visão geral das reservas</h2>
          <ul className="space-y-3">
            {stats.byStatus.map((s) => (
              <li key={s.status} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <ReservationBadge status={s.status} />
                  <span className="font-semibold">{s.count}</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${(s.count / max) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
