import AuthShell from "../feature/auth/components/AuthShell";
import RegisterForm from "../feature/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthShell>
      <RegisterForm />
    </AuthShell>
  );
}
