import { cn } from "@/lib/utils";
import type { ProductStatus } from "@/lib/peakcycle/store";
import type { ReservationStatus } from "@/lib/peakcycle/types";

const base =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap";

const reservationStyles: Record<ReservationStatus, string> = {
  pendente: "bg-warning/15 text-warning-foreground",
  confirmada: "bg-primary/12 text-primary",
  retirada: "bg-success/15 text-success",
  cancelada: "bg-destructive/12 text-destructive",
};

const reservationLabels: Record<ReservationStatus, string> = {
  pendente: "Pendente",
  confirmada: "Confirmada",
  retirada: "Retirada",
  cancelada: "Cancelada",
};

export function ReservationBadge({ status }: { status: ReservationStatus }) {
  return <span className={cn(base, reservationStyles[status])}>{reservationLabels[status]}</span>;
}

const productStyles: Record<ProductStatus, string> = {
  disponivel: "bg-success/15 text-success",
  reservado: "bg-primary/12 text-primary",
  esgotado: "bg-muted text-muted-foreground",
  vencido: "bg-destructive/12 text-destructive",
};

const productLabels: Record<ProductStatus, string> = {
  disponivel: "Disponível",
  reservado: "Reservado",
  esgotado: "Esgotado",
  vencido: "Vencido",
};

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  return <span className={cn(base, productStyles[status])}>{productLabels[status]}</span>;
}

export function ExpiryBadge({ text, tone }: { text: string; tone: "ok" | "warning" | "danger" }) {
  return (
    <span
      className={cn(
        base,
        tone === "danger" && "bg-destructive/12 text-destructive",
        tone === "warning" && "bg-warning/18 text-warning-foreground",
        tone === "ok" && "bg-secondary text-secondary-foreground",
      )}
    >
      {text}
    </span>
  );
}
