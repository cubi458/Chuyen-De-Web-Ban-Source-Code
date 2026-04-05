import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Routes, Navigate } from "react-router-dom"; // 🔄 đổi BrowserRouter -> HashRouter
import { CartProvider } from "context/CartContext";
import { AuthProvider, useAuth } from "context/AuthContext";
import { OrderProvider } from "context/OrderContext";

import "assets/css/bootstrap.min.css";
import "assets/scss/now-ui-kit.scss?v=1.5.0";
import "assets/demo/demo.css?v=1.5.0";
import "assets/demo/nucleo-icons-page-styles.css?v=1.5.0";

import Index from "views/Index";
import NucleoIcons from "views/NucleoIcons";
import LoginPage from "views/examples/LoginPage";
import LandingPage from "views/examples/LandingPage";
import ExampleProfilePage from "views/examples/ProfilePage";
import StoreProfilePage from "views/store/ProfilePage";
import HomePage from "views/store/HomePage";
import CatalogPage from "views/store/CatalogPage";
import StoreBlogPage from "views/store/StoreBlogPage";
import StoreBlogPostPage from "views/store/StoreBlogPostPage";
import SourceDetailPage from "views/store/SourceDetailPage";
import CartPage from "views/store/CartPage";
import CheckoutPage from "views/store/CheckoutPage";
import DownloadsPage from "views/store/DownloadsPage";
import DiscountCodesPage from "views/store/DiscountCodesPage";
import AuthPage from "views/store/AuthPage";
import AdminDashboard from "views/admin/AdminDashboard";
import AdminRoute from "components/Routes/AdminRoute";

const RoleRedirect: React.FC = () => {
    const { user, loading, isAdmin } = useAuth();

    if (loading) {
        return <div className="text-center mt-5">Đang tải...</div>;
    }

    if (!user) {
        return <Navigate to="/store" replace />;
    }

    return <Navigate to={isAdmin ? "/admin" : "/store"} replace />;
};

const rootElement = document.getElementById("root");

if (rootElement) {
    ReactDOM.render(
        <AuthProvider>
            <OrderProvider>
                <CartProvider>
                    <HashRouter>
                        <Routes>
                            <Route path="/" element={<RoleRedirect />} />
                            <Route path="/store" element={<HomePage />} />
                            <Route path="/store/catalog" element={<CatalogPage />} />
                            <Route path="/store/blog" element={<StoreBlogPage />} />
                            <Route path="/store/blog/:id" element={<StoreBlogPostPage />} />
                            <Route path="/store/source/:sourceId" element={<SourceDetailPage />} />
                            <Route path="/store/cart" element={<CartPage />} />
                            <Route path="/store/checkout" element={<CheckoutPage />} />
                            <Route path="/store/downloads" element={<DownloadsPage />} />
                            <Route path="/store/discount-codes" element={<DiscountCodesPage />} />
                            <Route path="/store/profile" element={<StoreProfilePage />} />
                            <Route path="/store/auth" element={<AuthPage />} />
                            <Route
                                path="/admin"
                                element={
                                    <AdminRoute>
                                        <AdminDashboard />
                                    </AdminRoute>
                                }
                            />
                            <Route path="/index" element={<Index />} />
                            <Route path="/nucleo-icons" element={<NucleoIcons />} />
                            <Route path="/landing-page" element={<LandingPage />} />
                            <Route path="/profile-page" element={<ExampleProfilePage />} />
                            <Route path="/login-page" element={<LoginPage />} />
                            <Route path="*" element={<Navigate to="/store" replace />} />
                        </Routes>
                    </HashRouter>
                </CartProvider>
            </OrderProvider>
        </AuthProvider>,
        rootElement
    );
}
