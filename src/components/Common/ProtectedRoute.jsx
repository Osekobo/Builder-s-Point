import { useLayoutEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { isAdminUser } from "../../utils/auth";
import Loading from "./Loading";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const sessionLoaded = useAuthStore((state) => state.sessionLoaded);
  const refreshSession = useAuthStore((state) => state.refreshSession);
  const userId = user?.id;
  const userIsAdmin = isAdminUser(user);
  const [isVerifyingAdmin, setIsVerifyingAdmin] = useState(adminOnly);

  useLayoutEffect(() => {
    if (!adminOnly) {
      setIsVerifyingAdmin(false);
      return;
    }

    if (!sessionLoaded) return;

    if (userId === undefined || userId === null || !userIsAdmin) {
      setIsVerifyingAdmin(false);
      return;
    }

    let active = true;
    setIsVerifyingAdmin(true);
    refreshSession()
      .catch(() => null)
      .finally(() => {
        if (active) setIsVerifyingAdmin(false);
      });

    return () => {
      active = false;
    };
  }, [adminOnly, refreshSession, sessionLoaded, userId, userIsAdmin]);

  if (!sessionLoaded || (adminOnly && isVerifyingAdmin)) {
    return <Loading />;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}${location.hash}`,
        }}
      />
    );
  }

  if (adminOnly && (!userIsAdmin || userId === undefined || userId === null)) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

export const PublicOnlyRoute = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const sessionLoaded = useAuthStore((state) => state.sessionLoaded);

  if (!sessionLoaded) return <Loading />;

  if (user) {
    return <Navigate to={isAdminUser(user) ? "/admin" : "/"} replace />;
  }

  return children;
};

export default ProtectedRoute;
