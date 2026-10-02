import { createFileRoute } from "@tanstack/react-router";
import { Heart, MapPin, Search, SearchX, Sprout } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { EmptyState } from "@/components/peakcycle/EmptyState";
import { ProductCard } from "@/components/peakcycle/ProductCard";
import { ProductDetailsDialog } from "@/components/peakcycle/ProductDetailsDialog";
import { ReserveDialog } from "@/components/peakcycle/ReserveDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { daysUntil } from "@/lib/peakcycle/format";
import { isActive, usePeakCycle } from "@/lib/peakcycle/store";
import { CATEGORIES, type Product } from "@/lib/peakcycle/types";

export const Route = createFileRoute("/app/")({
  component: ExplorePage,
});

type OfferFilter = "all" | "free" | "paid";
type SortBy = "expiry" | "quantity";

function ExplorePage() {
  const { products, reservations, session } = usePeakCycle();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [offer, setOffer] = useState<OfferFilter>("all");
  const [sort, setSort] = useState<SortBy>("expiry");
  const [details, setDetails] = useState<Product | null>(null);
  const [reserving, setReserving] = useState<Product | null>(null);

  const myRescued = useMemo(
    () =>
      reservations
        .filter((r) => r.clientId === session?.id && r.status !== "cancelada")
        .reduce((sum, r) => sum + r.quantity, 0),
    [reservations, session],
  );

  const visible = useMemo(() => {
    const list = products.filter((p) => {
      if (daysUntil(p.expiry) < 0) return false;
      if (query.trim() && !p.name.toLowerCase().includes(query.trim().toLowerCase())) return false;
      if (category !== "all" && p.category !== category) return false;
      if (offer !== "all" && p.offerType !== offer) return false;
      return true;
    });
    return list.sort((a, b) =>
      sort === "expiry"
        ? a.expiry.localeCompare(b.expiry)
        : b.quantity - a.quantity || a.expiry.localeCompare(b.expiry),
    );
  }, [products, query, category, offer, sort]);

  const activeCount = reservations.filter(
    (r) => r.clientId === session?.id && isActive(r.status),
  ).length;

  return (
    <div className="space-y-6">
      <section className="card-soft overflow-hidden">
        <div className="bg-secondary px-5 py-6">
          <p className="text-sm text-secondary-foreground">
            Olá, <strong>{session?.name}</strong> 👋
          </p>
          <h2 className="mt-1 font-display text-xl font-bold text-foreground">
            Boas escolhas alimentam pessoas e preservam o planeta.
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" /> São Paulo · 3 km ao redor
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sprout className="size-4 text-primary" /> {myRescued} itens resgatados por você
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/app/resgates">
                <Heart className="size-4" /> Meus Resgates
                {activeCount > 0 && (
                  <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                    {activeCount}
                  </span>
                )}
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/app/impacto">Ver meu impacto</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar alimento..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Buscar alimento"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger aria-label="Filtrar por categoria">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={offer} onValueChange={(v) => setOffer(v as OfferFilter)}>
            <SelectTrigger aria-label="Filtrar por tipo de oferta">
              <SelectValue placeholder="Tipo de oferta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Doação e preço simbólico</SelectItem>
              <SelectItem value="free">Somente doação gratuita</SelectItem>
              <SelectItem value="paid">Somente preço simbólico</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as SortBy)}>
            <SelectTrigger aria-label="Ordenar">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expiry">Validade mais próxima</SelectItem>
              <SelectItem value="quantity">Maior disponibilidade</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {visible.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Nenhum alimento encontrado"
          description="Ajuste a busca ou os filtros para ver outras ofertas disponíveis perto de você."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setCategory("all");
                setOffer("all");
              }}
            >
              Limpar filtros
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              disabled={p.quantity <= 0}
              onDetails={() => setDetails(p)}
              onReserve={() => setReserving(p)}
            />
          ))}
        </div>
      )}

      <ProductDetailsDialog
        product={details}
        open={details !== null}
        onOpenChange={(o) => !o && setDetails(null)}
        onReserve={() => setReserving(details)}
      />
      <ReserveDialog
        product={reserving}
        open={reserving !== null}
        onOpenChange={(o) => !o && setReserving(null)}
      />
    </div>
  );
}
