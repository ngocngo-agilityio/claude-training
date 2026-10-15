import { useEffect } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router";
import { shallow } from "zustand/shallow";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { ROUTES } from "@/constants/routes";
import { AppLayout } from "@/layouts/AppLayout";
import HomePage from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { RestaurantCopilotProvider } from "@/providers/RestaurantCopilotProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthenticatedRoute } from "@/routes/AuthenticatedRoute";
import { PublicRoute } from "@/routes/PublicRoute";
import { useAuthStore } from "@/stores/auth-store";
import { useConversationStore } from "@/stores/conversation-store";

const AuthenticatedLayout = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [loadConversations, clearConversationData] = useConversationStore(
    (state) => [state.loadConversations, state.clearConversationData],
    shallow,
  );

  useEffect(() => {
    // Load the user's conversations
    void loadConversations(accessToken);

    // Clear user-specific data when leaving the authenticated area.
    return clearConversationData;
  }, [accessToken, clearConversationData, loadConversations]);

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicRoute />}>
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            </Route>

            <Route element={<AuthenticatedRoute />}>
              <Route
                element={
                  <RestaurantCopilotProvider>
                    <AuthenticatedLayout />
                  </RestaurantCopilotProvider>
                }
              >
                <Route
                  path={ROUTES.ROOT}
                  element={<Navigate to={ROUTES.CHAT} replace />}
                />
                <Route path={ROUTES.CHAT} element={<HomePage />} />
                <Route path={ROUTES.CHAT_THREAD} element={<HomePage />} />
                <Route
                  path="*"
                  element={<Navigate to={ROUTES.CHAT} replace />}
                />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
