import { Navigate, Outlet } from "react-router";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/stores/auth-store";

export const PublicRoute = () => {
  const isAuthenticated = useAuthStore((state) => Boolean(state.accessToken));

  return isAuthenticated ? <Navigate to={ROUTES.CHAT} replace /> : <Outlet />;
};
