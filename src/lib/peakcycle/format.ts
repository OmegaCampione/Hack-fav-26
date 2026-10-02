export const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

/** Parses a yyyy-mm-dd string as a local date (avoids UTC off-by-one). */
export const parseISODate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y || 0, (m || 1) - 1, d || 1);
};

export const todayISO = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export const addDaysISO = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export const formatDate = (iso: string) => {
  if (!iso) return "—";
  return parseISODate(iso).toLocaleDateString("pt-BR");
};

export const formatDateTime = (isoDateTime: string) => {
  if (!isoDateTime) return "—";
  return new Date(isoDateTime).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/** Whole days between today and the expiry date. Negative = expired. */
export const daysUntil = (iso: string) => {
  const target = parseISODate(iso).getTime();
  const now = parseISODate(todayISO()).getTime();
  return Math.round((target - now) / 86_400_000);
};

export const expiryLabel = (iso: string) => {
  const d = daysUntil(iso);
  if (d < 0) return { text: "Vencido", tone: "danger" as const };
  if (d === 0) return { text: "Vence hoje", tone: "danger" as const };
  if (d === 1) return { text: "Vence amanhã", tone: "warning" as const };
  if (d <= 3) return { text: `Vence em ${d} dias`, tone: "warning" as const };
  return { text: `Válido até ${formatDate(iso)}`, tone: "ok" as const };
};
