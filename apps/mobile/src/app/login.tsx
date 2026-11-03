import { LoginScreen } from "@/screens/LoginScreen";
import { useAuth } from "@/providers/AuthProvider";

export default function LoginRoute() {
  const { signIn } = useAuth();

  // Signing in changes the token, and the layout's guards then show the home route.
  return <LoginScreen onLoginSuccess={(data) => signIn(data.accessToken)} />;
}
