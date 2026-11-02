import { createContext, useContext, useEffect, useState } from 'react';

/**
 * Cart lives in the browser (localStorage) until checkout.
 * Each line: { productId, name, tone, category, sizeKey, sizeLabel, unitPrice, qty }
 * unitPrice here is only for display — the server recalculates everything.
 */
const CartContext = createContext(null);
const KEY = 'bc_cart';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }, [items]);

  const add = (line) =>
    setItems((cur) => {
      const i = cur.findIndex((c) => c.productId === line.productId && c.sizeKey === line.sizeKey);
      if (i === -1) return [...cur, { ...line, qty: line.qty || 1 }];
      const next = [...cur];
      next[i] = { ...next[i], qty: next[i].qty + (line.qty || 1) };
      return next;
    });

  const setQty = (index, qty) =>
    setItems((cur) => (qty < 1 ? cur.filter((_, i) => i !== index) : cur.map((c, i) => (i === index ? { ...c, qty } : c))));

  const remove = (index) => setItems((cur) => cur.filter((_, i) => i !== index));
  const clear = () => setItems([]);
  const count = items.reduce((a, c) => a + c.qty, 0);

  // shape the server expects for /orders/quote and /orders
  const forApi = () => items.map(({ productId, sizeKey, qty }) => ({ productId, sizeKey, qty }));

  return (
    <CartContext.Provider value={{ items, add, setQty, remove, clear, count, forApi }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
