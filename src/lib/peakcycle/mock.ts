import banana from "@/assets/prod-banana.jpg";
import pao from "@/assets/prod-pao.jpg";
import tomate from "@/assets/prod-tomate.jpg";
import { addDaysISO } from "./format";
import type { Product, Reservation } from "./types";

export const STORE = { id: "store-1", name: "Mercado Boa Colheita" };

export const initialProducts = (): Product[] => [
  {
    id: "prod-1",
    storeId: STORE.id,
    storeName: STORE.name,
    name: "Banana Prata",
    category: "Frutas",
    quantity: 20,
    unit: "unidades",
    expiry: addDaysISO(2),
    offerType: "free",
    price: 0,
    description: "Bananas maduras, ótimas para consumo imediato ou vitaminas.",
    image: banana,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-2",
    storeId: STORE.id,
    storeName: STORE.name,
    name: "Pães Franceses",
    category: "Padaria",
    quantity: 15,
    unit: "unidades",
    expiry: addDaysISO(1),
    offerType: "paid",
    price: 2,
    description: "Pães assados hoje pela manhã, retirada até o fim do dia.",
    image: pao,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-3",
    storeId: STORE.id,
    storeName: STORE.name,
    name: "Tomates",
    category: "Verduras e Legumes",
    quantity: 10,
    unit: "kg",
    expiry: addDaysISO(3),
    offerType: "paid",
    price: 3,
    description: "Tomates maduros, ideais para molhos e saladas.",
    image: tomate,
    createdAt: new Date().toISOString(),
  },
];

export const initialReservations = (): Reservation[] => [
  {
    id: "res-1",
    code: "PC-8F2K1A",
    productId: "prod-1",
    productName: "Banana Prata",
    productImage: banana,
    storeId: STORE.id,
    storeName: STORE.name,
    clientId: "client-demo",
    clientName: "Ana Souza",
    quantity: 3,
    unit: "unidades",
    unitPrice: 0,
    total: 0,
    pickupDate: addDaysISO(1),
    pickupTime: "10:00",
    createdAt: new Date(Date.now() - 3600_000 * 20).toISOString(),
    status: "pendente",
    stockReturned: false,
  },
  {
    id: "res-2",
    code: "PC-3QD7ZP",
    productId: "prod-2",
    productName: "Pães Franceses",
    productImage: pao,
    storeId: STORE.id,
    storeName: STORE.name,
    clientId: "client-demo",
    clientName: "ONG Mãos que Alimentam",
    quantity: 5,
    unit: "unidades",
    unitPrice: 2,
    total: 10,
    pickupDate: addDaysISO(1),
    pickupTime: "16:30",
    createdAt: new Date(Date.now() - 3600_000 * 5).toISOString(),
    status: "confirmada",
    stockReturned: false,
  },
];

/** Demo reservations already consumed stock, so seed quantities are adjusted. */
export const seed = () => {
  const products = initialProducts();
  const reservations = initialReservations();
  for (const r of reservations) {
    const p = products.find((x) => x.id === r.productId);
    if (p) p.quantity = Math.max(0, p.quantity - r.quantity);
  }
  return { products, reservations };
};
