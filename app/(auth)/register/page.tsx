import { redirect } from "next/navigation";
import RegisterForm from "@/app/feature/auth/components/RegisterForm";
import { fetchCurrentUserServer } from "@/app/feature/feed/api/feedApi.server";

export default async function RegisterPage() {
  const currentUser = await fetchCurrentUserServer();

  if (currentUser) {
    redirect("/");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <main className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-auth lg:items-center">
        <RegisterForm />
      </main>
    </div>
  );
}
