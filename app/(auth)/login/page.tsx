import { redirect } from "next/navigation";
import LoginForm from "@/app/feature/auth/components/LoginForm";
import AuthHeroPanel from "@/app/feature/auth/components/AuthHeroPanel";
import { fetchCurrentUserServer } from "@/app/feature/feed/api/feedApi.server";

export default async function LoginPage() {
  const currentUser = await fetchCurrentUserServer();

  if (currentUser) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen w-full lg:grid-cols-3">
        <AuthHeroPanel
          eyebrow="Welcome back"
          title="Join conversations, share moments, and stay connected."
          description="Sign in to continue your social experience with stronger contrast in both light and dark mode."
        />

        <section className="flex items-center justify-center px-6 py-10 sm:px-10">
          <LoginForm />
        </section>
      </div>
    </div>
  );
}
