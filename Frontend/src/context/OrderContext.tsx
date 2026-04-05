import React from "react";
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    Timestamp,
} from "firebase/firestore";
import { db } from "lib/firebase";
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
    createdAt: Timestamp | null;
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

const OFFLINE_ORDERS_PREFIX = "source-market-offline-orders";
const buildOfflineKey = (userId: string) => `${OFFLINE_ORDERS_PREFIX}-${userId}`;

type StoredOfflineOrder = Omit<Order, "createdAt"> & { createdAt: string | null };

const readOfflineOrders = (userId: string): Order[] => {
    if (typeof window === "undefined") {
        return [];
    }

    try {
        const raw = localStorage.getItem(buildOfflineKey(userId));
        if (!raw) {
            return [];
        }
        const parsed = JSON.parse(raw) as StoredOfflineOrder[];
        return parsed.map((order) => ({
            ...order,
            createdAt: order.createdAt ? Timestamp.fromDate(new Date(order.createdAt)) : null,
        }));
    } catch (error) {
        console.warn("Failed to parse offline orders", error);
        return [];
    }
};

const persistOfflineOrders = (userId: string, orders: Order[]) => {
    if (typeof window === "undefined") {
        return;
    }

    try {
        const serializable: StoredOfflineOrder[] = orders.map((order) => ({
            ...order,
            createdAt: order.createdAt ? order.createdAt.toDate().toISOString() : null,
        }));
        localStorage.setItem(buildOfflineKey(userId), JSON.stringify(serializable));
    } catch (error) {
        console.warn("Failed to persist offline orders", error);
    }
};

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [remoteOrders, setRemoteOrders] = React.useState<Order[]>([]);
    const [offlineOrders, setOfflineOrders] = React.useState<Order[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!user) {
            setRemoteOrders([]);
            setOfflineOrders([]);
            setLoading(false);
            return;
        }

        const offlineSnapshot = readOfflineOrders(user.uid);
        setOfflineOrders(offlineSnapshot);
        setLoading(offlineSnapshot.length === 0);
        const ordersRef = collection(db, "orders");
        const q = query(
            ordersRef,
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const orderList: Order[] = [];
                snapshot.forEach((doc) => {
                    orderList.push({ id: doc.id, ...doc.data() } as Order);
                });
                setRemoteOrders(orderList);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching orders:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    const createOrder = React.useCallback(
        async (orderData: Omit<Order, "id" | "userId" | "userEmail" | "userName" | "createdAt">) => {
            if (!user) {
                throw new Error("Bạn cần đăng nhập để đặt hàng");
            }

            const sharedData = {
                ...orderData,
                userId: user.uid,
                userEmail: user.email || "",
                userName: user.displayName || "Khách hàng",
            };

            const firestorePayload: Omit<Order, "id"> = {
                ...sharedData,
                createdAt: serverTimestamp() as Timestamp,
            };

            try {
                const docRef = await addDoc(collection(db, "orders"), firestorePayload);
                return docRef.id;
            } catch (error) {
                console.warn("Falling back to offline order storage", error);
                const offlineOrder: Order = {
                    ...sharedData,
                    id: `offline-${Date.now()}`,
                    createdAt: Timestamp.fromDate(new Date()),
                };
                setOfflineOrders((prev) => {
                    const next = [offlineOrder, ...prev];
                    persistOfflineOrders(user.uid, next);
                    return next;
                });
                return offlineOrder.id!;
            }
        },
        [user]
    );

    const combinedOrders = React.useMemo(() => {
        const allOrders = [...offlineOrders, ...remoteOrders];
        return allOrders.sort((a, b) => {
            const timeA = a.createdAt ? a.createdAt.toMillis() : 0;
            const timeB = b.createdAt ? b.createdAt.toMillis() : 0;
            return timeB - timeA;
        });
    }, [offlineOrders, remoteOrders]);

    const value = React.useMemo(
        () => ({ orders: combinedOrders, loading, createOrder }),
        [combinedOrders, loading, createOrder]
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
