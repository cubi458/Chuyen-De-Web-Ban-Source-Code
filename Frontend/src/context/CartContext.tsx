import React from "react";
import {
  CartItem,
  findProductById,
  initialCartItems,
} from "data/sourceCatalog";

type CartActionResult = {
  success: boolean;
  message: string;
};

type CartContextValue = {
  items: CartItem[];
  addToCart: (productId: string) => CartActionResult;
  updateQuantity: (itemId: string, delta: number) => void;
  removeItem: (itemId: string) => void;
};

const CartContext = React.createContext<CartContextValue | undefined>(undefined);

const CART_STORAGE_KEY = "source-market-cart";

const sanitizeCartItems = (items: CartItem[]) =>
  items.filter((item) => findProductById(item.productId) && item.quantity > 0);

const loadInitialCart = (): CartItem[] => {
  if (typeof window === "undefined") {
    return [];
  }

  let parsed: CartItem[] = [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      parsed = JSON.parse(stored) as CartItem[];
    }
  } catch (error) {
    console.warn("Failed to parse cart storage", error);
  }

  if (!parsed || parsed.length === 0) {
    parsed = initialCartItems;
  }

  const sanitized = sanitizeCartItems(parsed || []);

  if (typeof window !== "undefined" && parsed && sanitized.length !== (parsed?.length || 0)) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(sanitized));
    } catch (error) {
      console.warn("Failed to persist sanitized cart", error);
    }
  }

  return sanitized;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = React.useState<CartItem[]>(() => loadInitialCart());

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.warn("Failed to persist cart storage", error);
    }
  }, [items]);

  const addToCart = React.useCallback((productId: string): CartActionResult => {
    const product = findProductById(productId);
    if (!product) {
      return { success: false, message: "Source không tồn tại." };
    }

    setItems((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.id === existing.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      const newItem: CartItem = {
        id: `cart-${Date.now()}`,
        productId,
        quantity: 1,
        license: "personal",
        supportPlan: "standard",
      };
      return [...prev, newItem];
    });

    return { success: true, message: `${product.title} đã được thêm vào giỏ hàng.` };
  }, []);

  const updateQuantity = React.useCallback((itemId: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  }, []);

  const removeItem = React.useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const value = React.useMemo(
    () => ({ items, addToCart, updateQuantity, removeItem }),
    [items, addToCart, updateQuantity, removeItem]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
