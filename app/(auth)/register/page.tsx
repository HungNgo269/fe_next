import AuthShell from "@/app/feature/auth/components/AuthShell";
import RegisterForm from "@/app/feature/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthShell>
      <RegisterForm />
    </AuthShell>
  );
}
