import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import Layout from "./components/Layout/Layout";
import ProtectedRoute, { PublicOnlyRoute } from "./components/Common/ProtectedRoute";
import Loading from "./components/Common/Loading";
import useAuthStore from "./store/authStore";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Orders = lazy(() => import("./pages/Orders"));
const OrderDetail = lazy(() => import("./pages/OrderDetail"));
const Account = lazy(() => import("./pages/Account"));
const AddProduct = lazy(() => import("./pages/Admin/AddProduct"));
const EditProduct = lazy(() => import("./pages/Admin/EditProduct"));
const ManageProducts = lazy(() => import("./pages/Admin/ManageProducts"));
const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard"));
const AdminOrders = lazy(() => import("./pages/Admin/AdminOrders"));
const CancelledOrders = lazy(() => import("./pages/Admin/CancelledOrders"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const InfoPage = lazy(() => import("./pages/InfoPage"));
const Forbidden = lazy(() => import("./pages/Forbidden"));

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
};

const AuthRedirect = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const handleExpiredSession = () => {
      if (pathname !== "/login") {
        toast.error("Your session has expired. Please log in again.");
        navigate("/login", { replace: true });
      }
    };
    const handleForbidden = () => {
      if (pathname.startsWith("/admin")) {
        toast.error("You do not have permission to access this page.");
        navigate("/403", { replace: true });
      }
    };
    window.addEventListener("auth:unauthorized", handleExpiredSession);
    window.addEventListener("auth:forbidden", handleForbidden);

    return () => {
      window.removeEventListener("auth:unauthorized", handleExpiredSession);
      window.removeEventListener("auth:forbidden", handleForbidden);
    };
  }, [navigate, pathname]);

  return null;
};

const SessionProvider = () => {
  const checkSession = useAuthStore((state) => state.checkSession);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return null;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <SessionProvider />
      <AuthRedirect />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#E04E00",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#EF4444",
              secondary: "#fff",
            },
          },
        }}
      />
      <Layout>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <Register />
                </PublicOnlyRoute>
              }
            />
            <Route path="/403" element={<Forbidden />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route
              path="/order/:id"
              element={
                <ProtectedRoute>
                  <OrderDetail />
                </ProtectedRoute>
              }
            />
            <Route path="/cart" element={<Cart />} />
            <Route path="/about" element={<InfoPage />} />
            <Route path="/contact" element={<InfoPage />} />
            <Route path="/faq" element={<InfoPage />} />
            <Route path="/privacy-policy" element={<InfoPage />} />
            <Route path="/terms" element={<InfoPage />} />
            <Route path="/returns" element={<InfoPage />} />
            <Route path="/payment" element={<InfoPage />} />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/add-product"
              element={
                <ProtectedRoute adminOnly>
                  <AddProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute adminOnly>
                  <ManageProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/edit-product/:id"
              element={
                <ProtectedRoute adminOnly>
                  <EditProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute adminOnly>
                  <AdminOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cancelled-orders"
              element={
                <ProtectedRoute adminOnly>
                  <CancelledOrders />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;
