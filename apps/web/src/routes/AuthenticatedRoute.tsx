import { Navigate, Outlet } from "react-router";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/stores/auth-store";

export const AuthenticatedRoute = () => {
  const isAuthenticated = useAuthStore((state) => Boolean(state.accessToken));

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
};
