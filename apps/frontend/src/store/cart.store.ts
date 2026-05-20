'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from '@shopping/shared';

export interface CartLine {
  productId: number;
  quantity: number;
  name: string;
  price: string;
  imageUrl?: string | null;
  stock: number;
}

interface CartState {
  items: CartLine[];
  /** After checkout completes, clears cart server-side UX */
  clear: () => void;
  /** Add or increment; respects stock */
  addProduct: (product: Product, qty?: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  removeLine: (productId: number) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      clear: () => set({ items: [] }),

      addProduct: (product, qty = 1) => {
        if (product.stock <= 0) return;
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id);
          const desired = qty + (existing?.quantity ?? 0);
          const nextQty = Math.min(desired, product.stock);
          if (nextQty < 1) return state;

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id
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
              },
            ],
          };
        });
      },

      setQuantity: (productId, quantity) => {
        if (quantity < 1) {
          set((state) => ({
            items: state.items.filter((i) => i.productId !== productId),
          }));
          return;
        }

        const line = get().items.find((i) => i.productId === productId);
        if (!line) return;

        const next = Math.min(quantity, line.stock);
        if (next < 1) {
          set((state) => ({
            items: state.items.filter((i) => i.productId !== productId),
          }));
          return;
        }

        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity: next } : i,
          ),
        }));
      },

      removeLine: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
    }),
    {
      name: 'shopping-cart',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
