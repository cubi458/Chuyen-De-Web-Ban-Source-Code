import React from "react";
import { apiRequest, getToken } from "lib/api";
import { useAuth } from "./AuthContext";

export type Order = {
    id?: string;
    userId: string;
    userEmail: string;
    userName: string;
    items: OrderItem[];
    subtotal: number;
    discountCode?: string;
    discountAmount: number;
    total: number;
    paymentMethod: string;
    status: "pending" | "paid" | "cancelled";
    createdAt: string | null;
    note?: string;
};

export type OrderItem = {
    productId: string;
    productTitle: string;
    price: number;
    quantity: number;
    license: string;
};

type OrderContextValue = {
    orders: Order[];
    loading: boolean;
    createOrder: (orderData: Omit<Order, "id" | "userId" | "userEmail" | "userName" | "createdAt">) => Promise<string>;
};

const OrderContext = React.createContext<OrderContextValue | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [orders, setOrders] = React.useState<Order[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const token = getToken();
        if (!user || !token) {
            setOrders([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        apiRequest<Order[]>("/orders", { method: "GET" }, true)
            .then((list) => {
                setOrders(list);
            })
            .catch((error) => {
                console.error("Error fetching orders:", error);
                setOrders([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [user]);

    const createOrder = React.useCallback(
        async (orderData: Omit<Order, "id" | "userId" | "userEmail" | "userName" | "createdAt">) => {
            if (!user || !getToken()) {
                throw new Error("Bạn cần đăng nhập để đặt hàng");
            }

            const created = await apiRequest<Order>(
                "/orders",
                {
                    method: "POST",
                    body: JSON.stringify(orderData),
                },
                true
            );

            setOrders((prev) => [created, ...prev]);
            return created.id || "";
        },
        [user]
    );

    const value = React.useMemo(
        () => ({ orders, loading, createOrder }),
        [orders, loading, createOrder]
    );

    return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrders = () => {
    const context = React.useContext(OrderContext);
    if (!context) {
        throw new Error("useOrders must be used within OrderProvider");
    }
    return context;
};
