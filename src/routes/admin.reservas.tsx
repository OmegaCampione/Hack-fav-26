import { createFileRoute } from "@tanstack/react-router";
import { CalendarX } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/peakcycle/EmptyState";
import { ReservationBadge } from "@/components/peakcycle/StatusBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { brl, formatDate, formatDateTime } from "@/lib/peakcycle/format";
import { usePeakCycle } from "@/lib/peakcycle/store";
import type { Reservation, ReservationStatus } from "@/lib/peakcycle/types";

export const Route = createFileRoute("/admin/reservas")({
  head: () => ({
    meta: [
      { title: "Reservas — PeakCycle" },
      { name: "description", content: "Gerencie as reservas recebidas pela sua loja." },
      { property: "og:title", content: "Reservas — PeakCycle" },
      { property: "og:description", content: "Confirme, finalize ou cancele reservas." },
    ],
  }),
  component: ReservationsPage,
});

type Filter = "todas" | ReservationStatus;

function ReservationsPage() {
  const { reservations, setReservationStatus } = usePeakCycle();
  const [filter, setFilter] = useState<Filter>("todas");
  const [toCancel, setToCancel] = useState<Reservation | null>(null);

  const list = useMemo(
    () =>
      reservations
        .filter((r) => filter === "todas" || r.status === filter)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [reservations, filter],
  );

  const change = (r: Reservation, status: ReservationStatus, msg: string) => {
    const result = setReservationStatus(r.id, status);
    if (result.ok) toast.success(msg);
    else toast.error(result.error);
  };

  return (
    <>
      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList className="flex w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="pendente">Pendentes</TabsTrigger>
          <TabsTrigger value="confirmada">Confirmadas</TabsTrigger>
          <TabsTrigger value="retirada">Retiradas</TabsTrigger>
          <TabsTrigger value="cancelada">Canceladas</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-4 space-y-3">
        {list.length === 0 ? (
          <EmptyState icon={CalendarX} title="Nenhuma reserva neste filtro" description="Novas reservas dos clientes aparecem aqui automaticamente." />
        ) : (
          list.map((r) => (
            <article key={r.id} className="card-soft flex flex-col gap-4 p-4 md:flex-row md:items-center">
              <img src={r.productImage} alt="" loading="lazy" className="h-24 w-full rounded-xl object-cover md:size-20" />
              <div className="flex-1 space-y-1 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display font-bold text-primary">{r.code}</span>
                  <ReservationBadge status={r.status} />
                </div>
                <p className="text-base font-semibold text-foreground">
                  {r.productName} · {r.quantity} {r.unit}
                </p>
                <p className="text-muted-foreground">Cliente: <strong className="text-foreground">{r.clientName}</strong></p>
                <p className="text-muted-foreground">
                  Retirada: {formatDate(r.pickupDate)} às {r.pickupTime} · Solicitado em {formatDateTime(r.createdAt)}
                </p>
                <p className="text-muted-foreground">Total: {r.total > 0 ? brl(r.total) : "Doação"}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {r.status === "pendente" && (
                  <Button size="sm" onClick={() => change(r, "confirmada", "Reserva confirmada.")}>Confirmar</Button>
                )}
                {(r.status === "pendente" || r.status === "confirmada") && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => change(r, "retirada", "Retirada registrada. Alimento salvo!")}>
                      Marcar retirada
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setToCancel(r)}>
                      Cancelar
                    </Button>
                  </>
                )}
              </div>
            </article>
          ))
        )}
      </div>

      <AlertDialog open={toCancel !== null} onOpenChange={(o) => !o && setToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar a reserva {toCancel?.code}?</AlertDialogTitle>
            <AlertDialogDescription>
              {toCancel?.quantity} {toCancel?.unit} voltarão ao estoque do produto (se ele ainda estiver cadastrado).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (toCancel) change(toCancel, "cancelada", "Reserva cancelada e estoque devolvido.");
                setToCancel(null);
              }}
            >
              Cancelar reserva
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
