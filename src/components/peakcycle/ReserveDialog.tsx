import { CalendarDays, CheckCircle2, Loader2, PartyPopper } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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
import { brl, formatDate, todayISO } from "@/lib/peakcycle/format";
import { usePeakCycle } from "@/lib/peakcycle/store";
import type { Product, Reservation } from "@/lib/peakcycle/types";

export function ReserveDialog({
  product,
  open,
  onOpenChange,
}: {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { createReservation } = usePeakCycle();
  const [quantity, setQuantity] = useState("1");
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState("10:00");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<Reservation | null>(null);

  useEffect(() => {
    if (open) {
      setQuantity("1");
      setDate(todayISO());
      setTime("10:00");
      setConfirmed(null);
      setSubmitting(false);
    }
  }, [open, product?.id]);

  const qty = Number(quantity);
  const unitPrice = product?.offerType === "paid" ? product.price : 0;
  const total = useMemo(
    () => (Number.isFinite(qty) && qty > 0 ? unitPrice * qty : 0),
    [qty, unitPrice],
  );

  if (!product) return null;

  const handleConfirm = () => {
    setSubmitting(true);
    const result = createReservation({
      productId: product.id,
      quantity: qty,
      pickupDate: date,
      pickupTime: time,
    });
    setSubmitting(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setConfirmed(result.data);
    toast.success("Reserva confirmada!", {
      description: `Código ${result.data.code}. Leve um documento na retirada.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {confirmed ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PartyPopper className="size-5 text-primary" /> Resgate confirmado
              </DialogTitle>
              <DialogDescription>
                Você acabou de evitar que {confirmed.quantity} {confirmed.unit} de alimento fossem
                desperdiçados. Obrigado!
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-xl bg-secondary p-4 text-sm">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Código do resgate
              </p>
              <p className="font-display text-2xl font-bold text-primary">{confirmed.code}</p>
              <ul className="mt-3 space-y-1 text-secondary-foreground">
                <li>
                  <strong>{confirmed.productName}</strong> — {confirmed.quantity} {confirmed.unit}
                </li>
                <li>Loja: {confirmed.storeName}</li>
                <li>
                  Retirada em {formatDate(confirmed.pickupDate)} às {confirmed.pickupTime}
                </li>
                <li>Total: {confirmed.total > 0 ? brl(confirmed.total) : "Doação gratuita"}</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              Apresente o código na loja no horário escolhido. Você pode acompanhar ou cancelar em
              "Meus Resgates".
            </p>
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Concluir</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Resgatar alimento</DialogTitle>
              <DialogDescription>Confira os dados e escolha a retirada.</DialogDescription>
            </DialogHeader>

            <div className="flex gap-3">
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                className="size-24 shrink-0 rounded-xl object-cover"
              />
              <div className="space-y-1 text-sm">
                <h3 className="text-base font-semibold text-foreground">{product.name}</h3>
                <p className="text-muted-foreground">{product.storeName}</p>
                <p className="text-muted-foreground">
                  {product.quantity} {product.unit} disponíveis · validade{" "}
                  {formatDate(product.expiry)}
                </p>
                <p className="font-semibold text-primary">
                  {product.offerType === "free" ? "Doação gratuita" : `${brl(product.price)} / ${product.unit}`}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="qty">Quantidade</Label>
                <Input
                  id="qty"
                  type="number"
                  min={1}
                  max={product.quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pickup-date">Data de retirada</Label>
                <Input
                  id="pickup-date"
                  type="date"
                  min={todayISO()}
                  max={product.expiry}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pickup-time">Horário</Label>
                <Input
                  id="pickup-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-xl bg-secondary p-4 text-sm text-secondary-foreground">
              <p className="mb-1 flex items-center gap-2 font-semibold">
                <CalendarDays className="size-4" /> Resumo da reserva
              </p>
              <p>
                {Number.isFinite(qty) && qty > 0 ? qty : 0} {product.unit} ·{" "}
                {date ? formatDate(date) : "—"} às {time || "—"}
              </p>
              <p className="mt-1 font-semibold">
                Total: {total > 0 ? brl(total) : "Gratuito"}
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleConfirm} disabled={submitting}>
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                Confirmar reserva
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
