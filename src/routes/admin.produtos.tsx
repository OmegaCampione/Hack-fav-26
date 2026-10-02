import { Link, createFileRoute } from "@tanstack/react-router";
import { Eye, PackageOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/peakcycle/EmptyState";
import { ProductDetailsDialog } from "@/components/peakcycle/ProductDetailsDialog";
import { ProductForm } from "@/components/peakcycle/ProductForm";
import { ProductStatusBadge } from "@/components/peakcycle/StatusBadge";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { brl, formatDate } from "@/lib/peakcycle/format";
import { isActive, usePeakCycle } from "@/lib/peakcycle/store";
import type { Product } from "@/lib/peakcycle/types";

export const Route = createFileRoute("/admin/produtos")({
  head: () => ({
    meta: [
      { title: "Meus Produtos — PeakCycle" },
      { name: "description", content: "Gerencie os alimentos cadastrados pela sua loja." },
      { property: "og:title", content: "Meus Produtos — PeakCycle" },
      { property: "og:description", content: "Estoque de alimentos da loja." },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { products, reservations, productStatus, updateProduct, deleteProduct } = usePeakCycle();
  const [viewing, setViewing] = useState<Product | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const activeFor = (id: string) =>
    reservations.filter((r) => r.productId === id && isActive(r.status)).length;

  const offer = (p: Product) => (p.offerType === "free" ? "Doação" : brl(p.price));

  const actions = (p: Product) => (
    <div className="flex gap-1">
      <Button variant="ghost" size="icon" aria-label={`Ver ${p.name}`} onClick={() => setViewing(p)}>
        <Eye className="size-4" />
      </Button>
      <Button variant="ghost" size="icon" aria-label={`Editar ${p.name}`} onClick={() => setEditing(p)}>
        <Pencil className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Excluir ${p.name}`}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => setDeleting(p)}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );

  if (products.length === 0) {
    return (
      <EmptyState
        icon={PackageOpen}
        title="Nenhum alimento cadastrado"
        description="Cadastre o primeiro item e ele aparece na hora para os clientes."
        action={
          <Button asChild>
            <Link to="/admin/cadastrar"><Plus className="size-4" /> Cadastrar alimento</Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button asChild>
          <Link to="/admin/cadastrar"><Plus className="size-4" /> Novo alimento</Link>
        </Button>
      </div>

      {/* Desktop table */}
      <div className="card-soft hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Qtd.</th>
              <th className="px-4 py-3">Validade</th>
              <th className="px-4 py-3">Oferta</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt="" loading="lazy" className="size-11 rounded-lg object-cover" />
                    <span className="font-medium text-foreground">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                <td className="px-4 py-3">{p.quantity} {p.unit}</td>
                <td className="px-4 py-3">{formatDate(p.expiry)}</td>
                <td className="px-4 py-3">{offer(p)}</td>
                <td className="px-4 py-3"><ProductStatusBadge status={productStatus(p)} /></td>
                <td className="px-4 py-3"><div className="flex justify-end">{actions(p)}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="grid gap-3 md:hidden">
        {products.map((p) => (
          <article key={p.id} className="card-soft flex gap-3 p-3">
            <img src={p.image} alt="" loading="lazy" className="size-20 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="truncate font-semibold text-foreground">{p.name}</h3>
                <ProductStatusBadge status={productStatus(p)} />
              </div>
              <p className="text-xs text-muted-foreground">
                {p.category} · {p.quantity} {p.unit} · {formatDate(p.expiry)} · {offer(p)}
              </p>
              {actions(p)}
            </div>
          </article>
        ))}
      </div>

      <ProductDetailsDialog product={viewing} open={viewing !== null} onOpenChange={(o) => !o && setViewing(null)} />

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar alimento</DialogTitle>
            <DialogDescription>As alterações aparecem imediatamente para os clientes.</DialogDescription>
          </DialogHeader>
          {editing && (
            <ProductForm
              key={editing.id}
              initial={editing}
              isEdit
              submitLabel="Salvar alterações"
              onCancel={() => setEditing(null)}
              onSubmit={(values) => {
                updateProduct(editing.id, values);
                toast.success("Produto atualizado.");
                setEditing(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleting !== null} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              O produto sai da vitrine. O histórico de reservas é mantido.
              {deleting && activeFor(deleting.id) > 0 &&
                ` Atenção: há ${activeFor(deleting.id)} reserva(s) ativa(s) — elas continuam válidas para retirada.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deleting) return;
                deleteProduct(deleting.id);
                toast.success("Produto excluído.");
                setDeleting(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
