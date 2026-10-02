import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { brl, expiryLabel, formatDate } from "@/lib/peakcycle/format";
import type { Product } from "@/lib/peakcycle/types";
import { ExpiryBadge } from "./StatusBadge";

export function ProductDetailsDialog({
  product,
  open,
  onOpenChange,
  onReserve,
}: {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReserve?: () => void;
}) {
  if (!product) return null;
  const expiry = expiryLabel(product.expiry);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>
            {product.category} · {product.storeName}
          </DialogDescription>
        </DialogHeader>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="aspect-[4/3] w-full rounded-xl object-cover"
        />
        <div className="flex flex-wrap items-center gap-2">
          <ExpiryBadge text={expiry.text} tone={expiry.tone} />
          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
            {product.quantity} {product.unit} disponíveis
          </span>
          <span className="rounded-full bg-primary/12 px-2.5 py-1 text-xs font-bold text-primary">
            {product.offerType === "free" ? "Doação gratuita" : brl(product.price)}
          </span>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Validade</dt>
            <dd className="font-medium">{formatDate(product.expiry)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Unidade</dt>
            <dd className="font-medium">{product.unit}</dd>
          </div>
        </dl>
        {product.description && (
          <p className="text-sm text-muted-foreground">{product.description}</p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          {onReserve && (
            <Button
              onClick={() => {
                onOpenChange(false);
                onReserve();
              }}
              disabled={product.quantity <= 0}
            >
              Resgatar alimento
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
