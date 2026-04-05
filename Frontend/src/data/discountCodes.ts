// Sample discount codes for the source code store
export type DiscountCode = {
    code: string;
    type: "percentage" | "fixed";
    value: number; // percentage (0-100) or fixed amount in USD
    minOrder: number; // minimum order amount to apply
    expiryDate: string; // ISO date string
    active: boolean;
    description: string;
};

export const sampleDiscountCodes: DiscountCode[] = [
    {
        code: "GIAM10",
        type: "percentage",
        value: 10,
        minOrder: 0,
        expiryDate: "2025-12-31",
        active: true,
        description: "Giảm 10% cho tất cả đơn hàng",
    },
    {
        code: "GIAM50K",
        type: "fixed",
        value: 50,
        minOrder: 100,
        expiryDate: "2025-12-31",
        active: true,
        description: "Giảm $50 cho đơn từ $100",
    },
    {
        code: "NEWUSER",
        type: "percentage",
        value: 15,
        minOrder: 0,
        expiryDate: "2025-12-31",
        active: true,
        description: "Giảm 15% cho người dùng mới",
    },
    {
        code: "FREESHIP",
        type: "fixed",
        value: 20,
        minOrder: 50,
        expiryDate: "2025-06-30",
        active: false,
        description: "Giảm $20 (đã hết hạn)",
    },
];

export const validateDiscountCode = (
    code: string,
    orderTotal: number
): { valid: boolean; discount: DiscountCode | null; message: string } => {
    const discount = sampleDiscountCodes.find(
        (d) => d.code.toUpperCase() === code.toUpperCase()
    );

    if (!discount) {
        return { valid: false, discount: null, message: "Mã giảm giá không tồn tại" };
    }

    if (!discount.active) {
        return { valid: false, discount: null, message: "Mã giảm giá đã hết hiệu lực" };
    }

    const now = new Date();
    const expiry = new Date(discount.expiryDate);
    if (now > expiry) {
        return { valid: false, discount: null, message: "Mã giảm giá đã hết hạn" };
    }

    if (orderTotal < discount.minOrder) {
        return {
            valid: false,
            discount: null,
            message: `Đơn hàng tối thiểu $${discount.minOrder} để sử dụng mã này`,
        };
    }

    return { valid: true, discount, message: discount.description };
};

export const calculateDiscount = (
    discount: DiscountCode,
    orderTotal: number
): number => {
    if (discount.type === "percentage") {
        return (orderTotal * discount.value) / 100;
    }
    return Math.min(discount.value, orderTotal);
};
