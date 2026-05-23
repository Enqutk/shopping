'use client';

import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import type { Product } from '@shopping/shared';

export interface CartLine {
  productId: number;
  quantity: number;
  name: string;
  price: string;
  imageUrl?: string | null;
  stock: number;
  color?: string;
  size?: string;
}

export interface CartLineOptions {
  color?: string;
  size?: string;
}

export function cartStorageKey(userId: number | null | undefined): string {
  return userId != null ? `shopping-cart-user-${userId}` : 'shopping-cart-guest';
}

/** Which account's cart is active in memory + localStorage writes */
let activeCartUserId: number | null = null;

function migrateLegacyCart() {
  if (typeof window === 'undefined') return;
  const legacy = localStorage.getItem('shopping-cart');
  if (legacy && !localStorage.getItem('shopping-cart-guest')) {
    localStorage.setItem('shopping-cart-guest', legacy);
  }
}

function readPersistedItems(userId: number | null): CartLine[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(cartStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { state?: { items?: CartLine[] } };
    return Array.isArray(parsed?.state?.items) ? parsed.state.items : [];
  } catch {
    return [];
  }
}

function writePersistedItems(userId: number | null, items: CartLine[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    cartStorageKey(userId),
    JSON.stringify({ state: { items }, version: 0 }),
  );
}

const perUserCartStorage: StateStorage = {
  getItem: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(cartStorageKey(activeCartUserId));
  },
  setItem: (_name, value) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(cartStorageKey(activeCartUserId), value);
  },
  removeItem: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(cartStorageKey(activeCartUserId));
  },
};

export function cartLineId(line: Pick<CartLine, 'productId' | 'color' | 'size'>): string {
  return `${line.productId}|${line.color ?? ''}|${line.size ?? ''}`;
}

function matchesLine(
  line: CartLine,
  productId: number,
  options?: CartLineOptions,
): boolean {
  return (
    line.productId === productId &&
    (line.color ?? '') === (options?.color ?? '') &&
    (line.size ?? '') === (options?.size ?? '')
  );
}

interface CartState {
  items: CartLine[];
  clear: () => void;
  addProduct: (product: Product, qty?: number, options?: CartLineOptions) => void;
  setQuantity: (productId: number, quantity: number, options?: CartLineOptions) => void;
  removeLine: (productId: number, options?: CartLineOptions) => void;
}

/**
 * Load the cart for the signed-in user (or guest). Call after auth is known
 * and whenever the user logs in, out, or switches accounts.
 */
export function syncCartToUser(userId: number | null | undefined) {
  if (typeof window === 'undefined') return;

  migrateLegacyCart();

  const nextId = userId ?? null;
  if (activeCartUserId === nextId) return;

  const currentItems = useCartStore.getState().items;
  writePersistedItems(activeCartUserId, currentItems);

  activeCartUserId = nextId;
  useCartStore.setState({ items: readPersistedItems(nextId) });
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      clear: () => set({ items: [] }),

      addProduct: (product, qty = 1, options) => {
        if (product.stock <= 0) return;
        set((state) => {
          const existing = state.items.find((i) =>
            matchesLine(i, product.id, options),
          );
          const desired = qty + (existing?.quantity ?? 0);
          const nextQty = Math.min(desired, product.stock);
          if (nextQty < 1) return state;

          if (existing) {
            return {
              items: state.items.map((i) =>
                matchesLine(i, product.id, options)
                  ? {
                      ...i,
                      quantity: nextQty,
                      name: product.name,
                      price: product.price,
                      imageUrl: product.imageUrl,
                      stock: product.stock,
                    }
                  : i,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                quantity: Math.min(qty, product.stock),
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                stock: product.stock,
                color: options?.color,
                size: options?.size,
              },
            ],
          };
        });
      },

      setQuantity: (productId, quantity, options) => {
        if (quantity < 1) {
          set((state) => ({
            items: state.items.filter((i) => !matchesLine(i, productId, options)),
          }));
          return;
        }

        const line = get().items.find((i) => matchesLine(i, productId, options));
        if (!line) return;

        const next = Math.min(quantity, line.stock);
        if (next < 1) {
          set((state) => ({
            items: state.items.filter((i) => !matchesLine(i, productId, options)),
          }));
          return;
        }

        set((state) => ({
          items: state.items.map((i) =>
            matchesLine(i, productId, options) ? { ...i, quantity: next } : i,
          ),
        }));
      },

      removeLine: (productId, options) =>
        set((state) => ({
          items: state.items.filter((i) => !matchesLine(i, productId, options)),
        })),
    }),
    {
      name: 'shopping-cart',
      storage: createJSONStorage(() => perUserCartStorage),
      skipHydration: true,
    },
  ),
);
