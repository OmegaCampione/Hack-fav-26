import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ProductForm } from "@/components/peakcycle/ProductForm";
import { usePeakCycle } from "@/lib/peakcycle/store";

export const Route = createFileRoute("/admin/cadastrar")({
  head: () => ({
    meta: [
      { title: "Cadastrar Alimento — PeakCycle" },
      { name: "description", content: "Publique um novo alimento para doação ou venda simbólica." },
      { property: "og:title", content: "Cadastrar Alimento — PeakCycle" },
      { property: "og:description", content: "Publique um novo alimento na vitrine PeakCycle." },
    ],
  }),
  component: NewProductPage,
});

function NewProductPage() {
  const { addProduct } = usePeakCycle();
  const navigate = useNavigate();

  return (
    <div className="card-soft p-5 sm:p-6">
      <ProductForm
        submitLabel="Publicar alimento"
        onSubmit={(values) => {
          const p = addProduct(values);
          toast.success(`${p.name} publicado!`, {
            description: "Já está visível na vitrine dos clientes.",
          });
          navigate({ to: "/admin/produtos" });
        }}
        onCancel={() => navigate({ to: "/admin/produtos" })}
      />
    </div>
  );
}
