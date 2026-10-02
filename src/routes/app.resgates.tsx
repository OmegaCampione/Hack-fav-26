import { Link, createFileRoute } from "@tanstack/react-router";
import { CalendarDays, PackageOpen, Store } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { brl, formatDate } from "@/lib/peakcycle/format";
import { isActive, usePeakCycle } from "@/lib/peakcycle/store";
import type { Reservation, ReservationStatus } from "@/lib/peakcycle/types";

export const Route = createFileRoute("/app/resgates")({
  head: () => ({
    meta: [
      { title: "Meus Resgates — PeakCycle" },
      { name: "description", content: "Acompanhe suas reservas, retiradas e cancelamentos." },
      { property: "og:title", content: "Meus Resgates — PeakCycle" },
      { property: "og:description", content: "Acompanhe suas reservas e retiradas." },
    ],
  }),
  component: RescuesPage,
});

const TABS: { value: string; label: string; match: (s: ReservationStatus) => boolean }[] = [
  { value: "todas", label: "Todas", match: () => true },
  { value: "pendentes", label: "Pendentes", match: (s) => s === "pendente" },
  { value: "confirmadas", label: "Confirmadas", match: (s) => s === "confirmada" },
  { value: "concluidas", label: "Concluídas", match: (s) => s === "retirada" },
  { value: "canceladas", label: "Canceladas", match: (s) => s === "cancelada" },
];

function RescuesPage() {
  const { reservations, session, setReservationStatus } = usePeakCycle();
  const [toCancel, setToCancel] = useState<Reservation | null>(null);

  const mine = useMemo(
    () =>
      reservations
        .filter((r) => r.clientId === session?.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [reservations, session],
  );

  const confirmCancel = () => {
    if (!toCancel) return;
    const result = setReservationStatus(toCancel.id, "cancelada");
    if (result.ok) {
      toast.success("Reserva cancelada e estoque devolvido à loja.");
    } else {
      toast.error(result.error);
    }
    setToCancel(null);
  };

  return (
    <>
      <Tabs defaultValue="todas">
        <TabsList className="flex w-full flex-wrap justify-start gap-1">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((t) => {
          const list = mine.filter((r) => t.match(r.status));
          return (
            <TabsContent key={t.value} value={t.value} className="mt-4 space-y-3">
              {list.length === 0 ? (
                <EmptyState
                  icon={PackageOpen}
                  title="Nenhum resgate por aqui"
                  description="Quando você reservar um alimento, ele aparece nesta lista com o código de retirada."
                  action={
                    <Button asChild>
                      <Link to="/app">Explorar alimentos</Link>
                    </Button>
                  }
                />
              ) : (
                list.map((r) => (
                  <article key={r.id} className="card-soft flex flex-col gap-4 p-4 sm:flex-row">
                    <img
                      src={r.productImage}
                      alt={r.productName}
                      loading="lazy"
                      className="h-28 w-full shrink-0 rounded-xl object-cover sm:size-28"
                    />
                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-sm font-bold text-primary">
                          {r.code}
                        </span>
                        <ReservationBadge status={r.status} />
                      </div>
                      <h3 className="text-base font-semibold text-foreground">{r.productName}</h3>
                      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Store className="size-3.5" /> {r.storeName}
                      </p>
                      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <CalendarDays className="size-3.5" /> Retirada em{" "}
                        {formatDate(r.pickupDate)} às {r.pickupTime}
                      </p>
                      <p className="text-sm">
                        {r.quantity} {r.unit} ·{" "}
                        <strong>{r.total > 0 ? brl(r.total) : "Doação gratuita"}</strong>
                      </p>
                      {r.status === "retirada" && (
                        <p className="text-sm font-medium text-primary">
                          Obrigado! Esse resgate evitou o desperdício de {r.quantity} {r.unit}.
                        </p>
                      )}
                    </div>
                    {isActive(r.status) && (
                      <div className="sm:self-center">
                        <Button
                          variant="outline"
                          className="w-full text-destructive hover:bg-destructive/10 sm:w-auto"
                          onClick={() => setToCancel(r)}
                        >
                          Cancelar reserva
                        </Button>
                      </div>
                    )}
                  </article>
                ))
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      <AlertDialog open={toCancel !== null} onOpenChange={(o) => !o && setToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar este resgate?</AlertDialogTitle>
            <AlertDialogDescription>
              A quantidade reservada volta para o estoque da loja e ficará disponível para outras
              pessoas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Manter reserva</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel}>Cancelar resgate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
