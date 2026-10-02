export type Role = "admin" | "client";

export interface Session {
  id: string;
  name: string;
  role: Role;
  storeName?: string;
}

export type OfferType = "free" | "paid";

export interface Product {
  id: string;
  storeId: string;
  storeName: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiry: string; // yyyy-mm-dd
  offerType: OfferType;
  price: number;
  description: string;
  image: string;
  createdAt: string;
}

export type ReservationStatus = "pendente" | "confirmada" | "retirada" | "cancelada";

export interface Reservation {
  id: string;
  code: string;
  productId: string;
  productName: string;
  productImage: string;
  storeId: string;
  storeName: string;
  clientId: string;
  clientName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  pickupDate: string; // yyyy-mm-dd
  pickupTime: string; // HH:mm
  createdAt: string;
  status: ReservationStatus;
  /** guards against returning stock twice on cancel */
  stockReturned: boolean;
}

export const CATEGORIES = [
  "Frutas",
  "Verduras e Legumes",
  "Padaria",
  "Laticínios",
  "Mercearia",
  "Congelados",
  "Outros",
] as const;

export const UNITS = ["unidades", "kg", "g", "litros", "pacotes", "caixas"] as const;
