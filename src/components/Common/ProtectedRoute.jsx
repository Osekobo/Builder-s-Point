import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import Loading from "./Loading";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const sessionLoaded = useAuthStore((state) => state.sessionLoaded);

  if (!sessionLoaded) {
    return <Loading />;
  }

  if (!user) {
    return (
      <Navigate to="/login" replace state={{ from: location.pathname }} />
    );
  }

  if (adminOnly && user.is_admin !== true) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default ProtectedRoute;