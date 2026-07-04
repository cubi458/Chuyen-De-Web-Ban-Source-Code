import React from "react";
import { CartItem } from "data/sourceCatalog";
import { apiRequest, getToken } from "lib/api";
import { useAuth } from "./AuthContext";

type CartActionResult = {
  success: boolean;
  message: string;
};

type CartContextValue = {
  items: CartItem[];
  addToCart: (productId: string) => Promise<CartActionResult>;
  updateQuantity: (itemId: string, delta: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
};

const CartContext = React.createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = React.useState<CartItem[]>([]);

  const normalizeCartItems = React.useCallback((list: CartItem[]) => {
    const seen = new Map<string, CartItem>();
    list
      .filter((item) => item.quantity > 0)
      .forEach((item) => {
        if (!seen.has(item.productId)) {
          seen.set(item.productId, { ...item, quantity: 1 });
        }
      });
    return Array.from(seen.values());
  }, []);

  React.useEffect(() => {
    const token = getToken();
    if (!user || !token) {
      setItems([]);
      return;
    }

    apiRequest<CartItem[]>("/cart", { method: "GET" }, true)
      .then((list) => {
        setItems(normalizeCartItems(list));
      })
      .catch((error) => {
        console.warn("Failed to load cart", error);
        setItems([]);
      });
  }, [user]);

  const addToCart = React.useCallback(async (productId: string): Promise<CartActionResult> => {
    const token = getToken();
    if (!token) {
      return { success: false, message: "Vui long dang nhap de su dung gio hang." };
    }

    const response = await apiRequest<{ success: boolean; message: string; items: CartItem[] }>(
      "/cart/add",
      {
        method: "POST",
        body: JSON.stringify({ productId }),
      },
      true
    );

    setItems(normalizeCartItems(response.items));

    return { success: true, message: response.message || "Da them san pham vao gio hang." };
  }, []);

  const updateQuantity = React.useCallback(async (itemId: string, delta: number) => {
    const token = getToken();
    if (!token) {
      return;
    }
    const next = await apiRequest<CartItem[]>(
      `/cart/${itemId}/quantity`,
      {
        method: "PATCH",
        body: JSON.stringify({ delta }),
      },
      true
    );
    setItems(normalizeCartItems(next));
  }, [normalizeCartItems]);

  const removeItem = React.useCallback(async (itemId: string) => {
    const token = getToken();
    if (!token) {
      return;
    }
    const next = await apiRequest<CartItem[]>(`/cart/${itemId}`, { method: "DELETE" }, true);
    setItems(normalizeCartItems(next));
  }, [normalizeCartItems]);

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
