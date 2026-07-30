'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { trackAddToCart, trackInitiateCheckout } from '@/lib/pixel';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartLineItem {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    price: { amount: string; currencyCode: string };
    product: {
      title: string;
      imageUrl: string | null;
      imageAlt: string | null;
    };
  };
}

interface Cart {
  id: string;
  checkoutUrl: string;
  lines: CartLineItem[];
  totalAmount: { amount: string; currencyCode: string };
}

interface CartContextValue {
  cart: Cart | null;
  isOpen: boolean;
  isLoading: boolean;
  itemCount: number;
  openCart: () => void;
  closeCart: () => void;
  addItem: (variantId: string, quantity: number) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  checkout: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Persist cart ID in localStorage
  const cartIdKey = 'eft_cart_id';

  useEffect(() => {
    const savedCartId = localStorage.getItem(cartIdKey);
    if (savedCartId) {
      // Attempt to restore cart (handled server-side if needed)
      // For now, clear stale IDs — user will create a new cart on next add
      // In production, add a GET_CART query to restore
    }
  }, []);

  const itemCount = cart?.lines.reduce((sum, l) => sum + l.quantity, 0) ?? 0;

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback(
    async (variantId: string, quantity: number) => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: cart ? 'add' : 'create',
            cartId: cart?.id,
            variantId,
            quantity,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.cart) {
            setCart(data.cart);
            localStorage.setItem(cartIdKey, data.cart.id);

            // Track AddToCart Pixel Event
            const addedItem = data.cart.lines.find((l: any) => l.merchandise.id === variantId);
            const priceVal = addedItem ? parseFloat(addedItem.merchandise.price.amount) : 0;
            trackAddToCart({
              content_ids: [variantId],
              content_name: addedItem?.merchandise.title || 'Product Variant',
              value: priceVal * quantity,
              currency: addedItem?.merchandise.price.currencyCode || 'PKR',
              quantity,
            });
          }
          setIsOpen(true);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [cart]
  );

  const updateItem = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cart) return;
      setIsLoading(true);
      try {
        if (quantity === 0) {
          // Remove item
          const res = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'remove',
              cartId: cart.id,
              lineId,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            setCart(data.cart);
          }
        } else {
          const res = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'update',
              cartId: cart.id,
              lineId,
              quantity,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            setCart(data.cart);
          }
        }
      } finally {
        setIsLoading(false);
      }
    },
    [cart]
  );

  const removeItem = useCallback(
    async (lineId: string) => {
      await updateItem(lineId, 0);
    },
    [updateItem]
  );

  const checkout = useCallback(() => {
    if (cart?.checkoutUrl) {
      // Track InitiateCheckout Pixel Event
      const contentIds = cart.lines.map((l) => l.merchandise.id);
      const totalVal = parseFloat(cart.totalAmount.amount) || 0;
      const numItems = cart.lines.reduce((sum, l) => sum + l.quantity, 0);
      
      trackInitiateCheckout({
        content_ids: contentIds,
        num_items: numItems,
        value: totalVal,
        currency: cart.totalAmount.currencyCode || 'PKR',
      });

      window.location.href = cart.checkoutUrl;
    }
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        isLoading,
        itemCount,
        openCart,
        closeCart,
        addItem,
        updateItem,
        removeItem,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
