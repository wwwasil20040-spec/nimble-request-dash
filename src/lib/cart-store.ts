import { useEffect, useState } from "react";

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
};

export type CartItem = { product: Product; qty: number };

const KEY = "aseel_cart_v1";
const listeners = new Set<() => void>();

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  listeners.forEach((fn) => fn());
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    setItems(read());
    const fn = () => setItems(read());
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);

  return {
    items,
    add(product: Product, qty = 1) {
      const cur = read();
      const idx = cur.findIndex((i) => i.product.id === product.id);
      if (idx >= 0) cur[idx].qty += qty;
      else cur.push({ product, qty });
      write(cur);
    },
    setQty(id: string, qty: number) {
      const cur = read()
        .map((i) => (i.product.id === id ? { ...i, qty: Math.max(0, qty) } : i))
        .filter((i) => i.qty > 0);
      write(cur);
    },
    remove(id: string) {
      write(read().filter((i) => i.product.id !== id));
    },
    clear() {
      write([]);
    },
    total: items.reduce((s, i) => s + i.qty * Number(i.product.price), 0),
    count: items.reduce((s, i) => s + i.qty, 0),
  };
}
