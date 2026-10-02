import { ImagePlus, Loader2, RotateCcw } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import placeholderImage from "@/assets/hero-peakcycle.jpg";
import { todayISO } from "@/lib/peakcycle/format";
import { CATEGORIES, UNITS, type OfferType, type Product } from "@/lib/peakcycle/types";

export type ProductFormValues = Omit<Product, "id" | "storeId" | "storeName" | "createdAt">;

type Errors = Partial<Record<keyof ProductFormValues, string>>;

const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;

export function ProductForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
  isEdit,
}: {
  initial?: Product;
  submitLabel: string;
  onSubmit: (values: ProductFormValues) => void;
  onCancel?: () => void;
  isEdit?: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [quantity, setQuantity] = useState(initial ? String(initial.quantity) : "");
  const [unit, setUnit] = useState(initial?.unit ?? "unidades");
  const [expiry, setExpiry] = useState(initial?.expiry ?? "");
  const [offerType, setOfferType] = useState<OfferType>(initial?.offerType ?? "free");
  const [price, setPrice] = useState(initial && initial.price > 0 ? String(initial.price) : "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((e) => ({ ...e, image: "Selecione um arquivo de imagem." }));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setErrors((e) => ({ ...e, image: "A imagem deve ter no máximo 1,5 MB." }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(String(reader.result));
      setErrors((e) => {
        const next = { ...e };
        delete next.image;
        return next;
      });
    };
    reader.readAsDataURL(file);
  };

  const validate = (): Errors => {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = "Informe o nome do alimento.";
    if (!category) next.category = "Escolha uma categoria.";
    const q = Number(quantity);
    if (quantity === "" || !Number.isFinite(q)) next.quantity = "Informe a quantidade.";
    else if (isEdit ? q < 0 : q <= 0) next.quantity = isEdit ? "A quantidade não pode ser negativa." : "A quantidade deve ser maior que zero.";
    if (!unit) next.unit = "Escolha a unidade.";
    if (!expiry) next.expiry = "Informe a data de validade.";
    else if (!isEdit && expiry < todayISO()) next.expiry = "A validade não pode estar no passado.";
    if (offerType === "paid") {
      const p = Number(price.replace(",", "."));
      if (!price || !Number.isFinite(p) || p <= 0) next.price = "Informe um valor maior que zero.";
    }
    return next;
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSubmitting(true);
    onSubmit({
      name: name.trim(),
      category,
      quantity: Math.floor(Number(quantity)),
      unit,
      expiry,
      offerType,
      price: offerType === "paid" ? Number(price.replace(",", ".")) : 0,
      description: description.trim(),
      image: image || placeholderImage,
    });
    setSubmitting(false);
  };

  const err = (key: keyof ProductFormValues) =>
    errors[key] ? <p className="text-xs font-medium text-destructive">{errors[key]}</p> : null;

  return (
    <form onSubmit={submit} noValidate className="grid gap-5 lg:grid-cols-[1fr_280px]">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="pf-name">Nome do alimento *</Label>
          <Input id="pf-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Iogurte natural" />
          {err("name")}
        </div>
        <div className="space-y-1.5">
          <Label>Categoria *</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger aria-label="Categoria">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {err("category")}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pf-expiry">Data de validade *</Label>
          <Input id="pf-expiry" type="date" min={isEdit ? undefined : todayISO()} value={expiry} onChange={(e) => setExpiry(e.target.value)} />
          {err("expiry")}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pf-qty">Quantidade disponível *</Label>
          <Input id="pf-qty" type="number" min={isEdit ? 0 : 1} step={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          {err("quantity")}
        </div>
        <div className="space-y-1.5">
          <Label>Unidade de medida *</Label>
          <Select value={unit} onValueChange={setUnit}>
            <SelectTrigger aria-label="Unidade de medida">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {UNITS.map((u) => (
                <SelectItem key={u} value={u}>{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {err("unit")}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Tipo de oferta *</Label>
          <RadioGroup value={offerType} onValueChange={(v) => setOfferType(v as OfferType)} className="flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <RadioGroupItem value="free" /> Doação gratuita
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <RadioGroupItem value="paid" /> Preço simbólico
            </label>
          </RadioGroup>
        </div>
        {offerType === "paid" && (
          <div className="space-y-1.5">
            <Label htmlFor="pf-price">Valor por unidade (R$) *</Label>
            <Input id="pf-price" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="2,50" />
            {err("price")}
          </div>
        )}
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="pf-desc">Descrição ou observações</Label>
          <Textarea id="pf-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Estado do produto, condições de retirada..." />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Foto do produto</Label>
        <div className="overflow-hidden rounded-xl border border-dashed border-border bg-secondary">
          <img src={image || placeholderImage} alt="Pré-visualização" className="aspect-[4/3] w-full object-cover" />
        </div>
        {!image && <p className="text-xs text-muted-foreground">Sem foto, usaremos uma imagem ilustrativa.</p>}
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" asChild>
            <label className="cursor-pointer">
              <ImagePlus className="size-4" /> Enviar foto
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => handleFile(e.target.files?.[0])} />
            </label>
          </Button>
          {image && (
            <Button type="button" variant="ghost" size="icon" aria-label="Usar imagem ilustrativa" onClick={() => setImage("")}>
              <RotateCcw className="size-4" />
            </Button>
          )}
        </div>
        {err("image")}
      </div>

      <div className="flex flex-wrap gap-2 lg:col-span-2">
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        )}
      </div>
    </form>
  );
}
