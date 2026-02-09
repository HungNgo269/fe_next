import AuthShell from "../feature/auth/components/AuthShell";
import RegisterForm from "../feature/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Start your journey with Pulse"
      subtitle="Create a new account to explore the community, share stories, and connect."
    >
      <RegisterForm />
    </AuthShell>
  );
}
