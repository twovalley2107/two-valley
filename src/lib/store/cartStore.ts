import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartLineItem } from "@/types";

export interface CartState {
  items: CartLineItem[];
  isOpen: boolean;

  // Store Actions
  addItem: (item: Omit<CartLineItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Computed Values / Helpers
  getCartTotal: () => number;
  getFormattedCartTotal: () => string;
  getCartCount: () => number;
  getFreeShippingProgress: () => {
    threshold: number;
    currentSubtotal: number;
    remaining: number;
    percentage: number;
    isEligible: boolean;
  };
}

const FREE_SHIPPING_THRESHOLD = 200;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        const qtyToAdd = newItem.quantity && newItem.quantity > 0 ? newItem.quantity : 1;
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.productId === newItem.productId && item.variantId === newItem.variantId
          );

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            const existingItem = updatedItems[existingIndex];
            const maxAllowed = Math.max(1, newItem.stockQuantity ?? existingItem.stockQuantity ?? 99);
            const newQty = Math.min(existingItem.quantity + qtyToAdd, maxAllowed);

            updatedItems[existingIndex] = {
              ...existingItem,
              quantity: newQty,
              stockQuantity: newItem.stockQuantity ?? existingItem.stockQuantity,
            };

            return { items: updatedItems, isOpen: true };
          }

          const clampedQty = Math.min(
            qtyToAdd,
            Math.max(1, newItem.stockQuantity ?? 99)
          );

          const itemToAdd: CartLineItem = {
            productId: newItem.productId,
            variantId: newItem.variantId,
            productSlug: newItem.productSlug,
            name: newItem.name,
            variantName: newItem.variantName,
            price: newItem.price,
            image: newItem.image,
            quantity: clampedQty,
            stockQuantity: newItem.stockQuantity,
          };

          return { items: [...state.items, itemToAdd], isOpen: true };
        });
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.productId === productId && item.variantId === variantId)
          ),
        }));
      },

      updateQuantity: (productId, variantId, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map((item) => {
            if (item.productId === productId && item.variantId === variantId) {
              const maxAllowed = Math.max(1, item.stockQuantity);
              const validQty = Math.min(Math.max(1, Math.floor(quantity)), maxAllowed);
              return { ...item, quantity: validQty };
            }
            return item;
          }),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      getCartTotal: () => {
        const { items } = get();
        const totalInCents = items.reduce((sum, item) => {
          const itemPriceCents = Math.round(Number(item.price) * 100);
          return sum + itemPriceCents * item.quantity;
        }, 0);
        return totalInCents / 100;
      },

      getFormattedCartTotal: () => {
        const total = get().getCartTotal();
        return `$${total.toFixed(2)}`;
      },

      getCartCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },

      getFreeShippingProgress: () => {
        const subtotal = get().getCartTotal();
        const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
        const percentage = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
        return {
          threshold: FREE_SHIPPING_THRESHOLD,
          currentSubtotal: subtotal,
          remaining,
          percentage,
          isEligible: subtotal >= FREE_SHIPPING_THRESHOLD,
        };
      },
    }),
    {
      name: "two-valley-cart",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
