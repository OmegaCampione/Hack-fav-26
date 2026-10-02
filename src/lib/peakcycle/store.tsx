import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { daysUntil, todayISO } from "./format";
import { seed, STORE } from "./mock";
import { KEYS, storage } from "./storage";
import type { Product, Reservation, ReservationStatus, Role, Session } from "./types";

const ACTIVE: ReservationStatus[] = ["pendente", "confirmada"];

export type ProductStatus = "disponivel" | "reservado" | "esgotado" | "vencido";

export interface ReservationInput {
  productId: string;
  quantity: number;
  pickupDate: string;
  pickupTime: string;
}

export type Result<T = void> = { ok: true; data: T } | { ok: false; error: string };

interface PeakCycleContextValue {
  hydrated: boolean;
  session: Session | null;
  products: Product[];
  reservations: Reservation[];
  login: (role: Role, name?: string) => Session;
  logout: () => void;
  addProduct: (input: Omit<Product, "id" | "storeId" | "storeName" | "createdAt">) => Product;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  createReservation: (input: ReservationInput) => Result<Reservation>;
  setReservationStatus: (id: string, status: ReservationStatus) => Result;
  productStatus: (p: Product) => ProductStatus;
  resetDemoData: () => void;
}

const PeakCycleContext = createContext<PeakCycleContextValue | null>(null);

const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const makeCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  return `PC-${out}`;
};

export function PeakCycleProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // Hydrate after mount so SSR markup and first client render always match.
  useEffect(() => {
    const storedProducts = storage.read<Product[] | null>(KEYS.products, null);
    const storedReservations = storage.read<Reservation[] | null>(KEYS.reservations, null);
    if (storedProducts && storedReservations) {
      setProducts(storedProducts);
      setReservations(storedReservations);
    } else {
      const fresh = seed();
      setProducts(fresh.products);
      setReservations(fresh.reservations);
      storage.write(KEYS.products, fresh.products);
      storage.write(KEYS.reservations, fresh.reservations);
    }
    setSession(storage.read<Session | null>(KEYS.session, null));
    setHydrated(true);
  }, []);

  const persistProducts = useCallback((next: Product[]) => {
    setProducts(next);
    storage.write(KEYS.products, next);
  }, []);

  const persistReservations = useCallback((next: Reservation[]) => {
    setReservations(next);
    storage.write(KEYS.reservations, next);
  }, []);

  const login = useCallback((role: Role, name?: string) => {
    const next: Session =
      role === "admin"
        ? { id: STORE.id, name: name?.trim() || STORE.name, role, storeName: name?.trim() || STORE.name }
        : { id: "client-demo", name: name?.trim() || "Ana Souza", role };
    setSession(next);
    storage.write(KEYS.session, next);
    return next;
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    storage.remove(KEYS.session);
  }, []);

  const addProduct: PeakCycleContextValue["addProduct"] = useCallback(
    (input) => {
      const product: Product = {
        ...input,
        id: uid("prod"),
        storeId: STORE.id,
        storeName: STORE.name,
        createdAt: new Date().toISOString(),
      };
      setProducts((prev) => {
        const next = [product, ...prev];
        storage.write(KEYS.products, next);
        return next;
      });
      return product;
    },
    [],
  );

  const updateProduct: PeakCycleContextValue["updateProduct"] = useCallback((id, patch) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...patch } : p));
      storage.write(KEYS.products, next);
      return next;
    });
  }, []);

  // Deleting a product never deletes reservation history: reservations keep a
  // snapshot of name/image/price at reservation time.
  const deleteProduct: PeakCycleContextValue["deleteProduct"] = useCallback((id) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      storage.write(KEYS.products, next);
      return next;
    });
  }, []);

  const createReservation: PeakCycleContextValue["createReservation"] = useCallback(
    (input) => {
      const product = products.find((p) => p.id === input.productId);
      if (!product) return { ok: false, error: "Produto não encontrado." };
      if (daysUntil(product.expiry) < 0)
        return { ok: false, error: "Este alimento está vencido e não pode ser resgatado." };
      if (product.quantity <= 0) return { ok: false, error: "Este alimento está esgotado." };
      if (!Number.isFinite(input.quantity) || input.quantity <= 0)
        return { ok: false, error: "Informe uma quantidade válida." };
      if (input.quantity > product.quantity)
        return { ok: false, error: `Disponível apenas ${product.quantity} ${product.unit}.` };
      if (!input.pickupDate) return { ok: false, error: "Escolha a data de retirada." };
      if (input.pickupDate < todayISO())
        return { ok: false, error: "A data de retirada não pode ser anterior a hoje." };
      if (input.pickupDate > product.expiry)
        return { ok: false, error: "A retirada deve acontecer antes da data de validade." };
      if (!input.pickupTime) return { ok: false, error: "Escolha o horário de retirada." };

      const unitPrice = product.offerType === "paid" ? product.price : 0;
      const reservation: Reservation = {
        id: uid("res"),
        code: makeCode(),
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        storeId: product.storeId,
        storeName: product.storeName,
        clientId: session?.role === "client" ? session.id : "client-demo",
        clientName: session?.role === "client" ? session.name : "Cliente PeakCycle",
        quantity: input.quantity,
        unit: product.unit,
        unitPrice,
        total: unitPrice * input.quantity,
        pickupDate: input.pickupDate,
        pickupTime: input.pickupTime,
        createdAt: new Date().toISOString(),
        status: "pendente",
        stockReturned: false,
      };

      persistProducts(
        products.map((p) =>
          p.id === product.id ? { ...p, quantity: p.quantity - input.quantity } : p,
        ),
      );
      persistReservations([reservation, ...reservations]);
      return { ok: true, data: reservation };
    },
    [persistProducts, persistReservations, products, reservations, session],
  );

  const setReservationStatus: PeakCycleContextValue["setReservationStatus"] = useCallback(
    (id, status) => {
      const reservation = reservations.find((r) => r.id === id);
      if (!reservation) return { ok: false, error: "Reserva não encontrada." };
      if (reservation.status === status) return { ok: true, data: undefined };
      if (reservation.status === "cancelada")
        return { ok: false, error: "Esta reserva já foi cancelada." };
      if (reservation.status === "retirada")
        return { ok: false, error: "Esta reserva já foi retirada." };

      let stockReturned = reservation.stockReturned;
      if (status === "cancelada" && !reservation.stockReturned) {
        stockReturned = true;
        // Product may have been deleted by the store — then there is no stock
        // to give back, but the history entry stays intact.
        const exists = products.some((p) => p.id === reservation.productId);
        if (exists) {
          persistProducts(
            products.map((p) =>
              p.id === reservation.productId
                ? { ...p, quantity: p.quantity + reservation.quantity }
                : p,
            ),
          );
        }
      }

      persistReservations(
        reservations.map((r) => (r.id === id ? { ...r, status, stockReturned } : r)),
      );
      return { ok: true, data: undefined };
    },
    [persistProducts, persistReservations, products, reservations],
  );

  const productStatus = useCallback(
    (p: Product): ProductStatus => {
      if (daysUntil(p.expiry) < 0) return "vencido";
      if (p.quantity <= 0) return "esgotado";
      if (reservations.some((r) => r.productId === p.id && ACTIVE.includes(r.status)))
        return "reservado";
      return "disponivel";
    },
    [reservations],
  );

  const resetDemoData = useCallback(() => {
    const fresh = seed();
    persistProducts(fresh.products);
    persistReservations(fresh.reservations);
  }, [persistProducts, persistReservations]);

  const value = useMemo<PeakCycleContextValue>(
    () => ({
      hydrated,
      session,
      products,
      reservations,
      login,
      logout,
      addProduct,
      updateProduct,
      deleteProduct,
      createReservation,
      setReservationStatus,
      productStatus,
      resetDemoData,
    }),
    [
      hydrated,
      session,
      products,
      reservations,
      login,
      logout,
      addProduct,
      updateProduct,
      deleteProduct,
      createReservation,
      setReservationStatus,
      productStatus,
      resetDemoData,
    ],
  );

  return <PeakCycleContext.Provider value={value}>{children}</PeakCycleContext.Provider>;
}

export function usePeakCycle() {
  const ctx = useContext(PeakCycleContext);
  if (!ctx) throw new Error("usePeakCycle deve ser usado dentro de PeakCycleProvider");
  return ctx;
}

export const isActive = (status: ReservationStatus) => ACTIVE.includes(status);
