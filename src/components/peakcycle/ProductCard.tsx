import { Clock, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { brl, expiryLabel } from "@/lib/peakcycle/format";
import type { Product } from "@/lib/peakcycle/types";
import { ExpiryBadge } from "./StatusBadge";

export function ProductCard({
  product,
  onDetails,
  onReserve,
  disabled,
}: {
  product: Product;
  onDetails: () => void;
  onReserve: () => void;
  disabled?: boolean;
}) {
  const expiry = expiryLabel(product.expiry);

  return (
    <article className="card-soft group flex flex-col overflow-hidden transition-shadow hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <ExpiryBadge text={expiry.text} tone={expiry.tone} />
        </div>
        <div className="absolute right-3 top-3">
          <span className="rounded-full bg-card/95 px-2.5 py-1 text-xs font-bold text-primary shadow-soft">
            {product.offerType === "free" ? "Grátis" : brl(product.price)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {product.category}
        </span>
        <h3 className="text-base leading-tight font-semibold text-foreground">{product.name}</h3>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Store className="size-3.5" /> {product.storeName}
        </p>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="size-3.5" />
          {product.quantity > 0
            ? `${product.quantity} ${product.unit} disponíveis`
            : "Esgotado por enquanto"}
        </p>

        <div className="mt-auto flex gap-2 pt-3">
          <Button variant="outline" className="flex-1" onClick={onDetails}>
            Ver detalhes
          </Button>
          <Button className="flex-1" onClick={onReserve} disabled={disabled}>
            Resgatar
          </Button>
        </div>
      </div>
    </article>
  );
}
