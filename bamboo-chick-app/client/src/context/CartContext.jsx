import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
const KEY = 'bc_cart';
const MAX_ITEM_LIMIT = 10;
const MAX_TOTAL_CART_ITEMS = 20;

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY)) || [];
    return saved.map(item => ({
      ...item,
      qty: Math.min(item.qty, MAX_ITEM_LIMIT)
    }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }, [items]);

  const add = (line) =>
    setItems((cur) => {
      const currentTotalQty = cur.reduce((a, c) => a + c.qty, 0);
      const incomingQty = line.qty || 1;

      if (currentTotalQty + incomingQty > MAX_TOTAL_CART_ITEMS) {
        alert(`Sorry, your total cart limit cannot exceed ${MAX_TOTAL_CART_ITEMS} items.`);
        return cur;
      }

      const i = cur.findIndex((c) => c.productId === line.productId && c.sizeKey === line.sizeKey);

      if (i === -1) {
        if (incomingQty > MAX_ITEM_LIMIT) {
          alert(`Sorry, you can add a maximum of ${MAX_ITEM_LIMIT} units of this product and size.`);
          return cur;
        }
        return [...cur, { ...line, qty: incomingQty }];
      }

      const next = [...cur];
      const newTotalQty = next[i].qty + incomingQty;

      if (newTotalQty > MAX_ITEM_LIMIT) {
        alert(`Sorry, you can keep a maximum of ${MAX_ITEM_LIMIT} units in total for this product and size. You already have ${next[i].qty} in your cart.`);
        return cur;
      }

      next[i] = { ...next[i], qty: newTotalQty };
      return next;
    });

  const setQty = (index, qty) =>
    setItems((cur) => {
      if (qty < 1) {
        return cur.filter((_, i) => i !== index);
      }

      if (qty > MAX_ITEM_LIMIT) {
        alert(`Quantity cannot exceed ${MAX_ITEM_LIMIT} units for a single item.`);
        return cur;
      }

      const otherTotalQty = cur.reduce((sum, item, i) => (i === index ? sum : sum + item.qty), 0);

      if (otherTotalQty + qty > MAX_TOTAL_CART_ITEMS) {
        alert(`Sorry, your total cart limit cannot exceed ${MAX_TOTAL_CART_ITEMS} items.`);
        return cur;
      }

      return cur.map((c, i) => (i === index ? { ...c, qty } : c));
    });

  const remove = (index) => setItems((cur) => cur.filter((_, i) => i !== index));
  const clear = () => setItems([]);
  const count = items.reduce((a, c) => a + c.qty, 0);

  const forApi = () => items.map(({ productId, sizeKey, qty }) => ({ productId, sizeKey, qty }));

  return (
    <CartContext.Provider value={{ items, add, setQty, remove, clear, count, forApi }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);