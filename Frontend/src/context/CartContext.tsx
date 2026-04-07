import React from "react";
import {
  CartItem,
  findProductById,
} from "data/sourceCatalog";
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

  React.useEffect(() => {
    const token = getToken();
    if (!user || !token) {
      setItems([]);
      return;
    }

    apiRequest<CartItem[]>("/cart", { method: "GET" }, true)
      .then((list) => {
        setItems(list.filter((item) => findProductById(item.productId) && item.quantity > 0));
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

    const product = findProductById(productId);
    if (!product) {
      return { success: false, message: "Source không tồn tại." };
    }

    const response = await apiRequest<{ success: boolean; message: string; items: CartItem[] }>(
      "/cart/add",
      {
        method: "POST",
        body: JSON.stringify({ productId }),
      },
      true
    );

    setItems(response.items);

    return { success: true, message: response.message || `${product.title} đã được thêm vào giỏ hàng.` };
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
    setItems(next);
  }, []);

  const removeItem = React.useCallback(async (itemId: string) => {
    const token = getToken();
    if (!token) {
      return;
    }
    const next = await apiRequest<CartItem[]>(`/cart/${itemId}`, { method: "DELETE" }, true);
    setItems(next);
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
