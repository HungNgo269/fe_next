import AuthShell from "../feature/auth/components/AuthShell";
import LoginForm from "../feature/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <AuthShell
      title="Sign in to start connecting"
      subtitle="Manage your account, follow friends, and stay updated with Pulse."
    >
      <LoginForm />
    </AuthShell>
  );
}
