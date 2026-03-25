import LoginForm from "@/app/feature/auth/components/LoginForm";
import AuthHeroPanel from "@/app/feature/auth/components/AuthHeroPanel";
import FeedPage from "@/app/feature/feed/components/FeedPage";
import { fetchCurrentUserServer } from "@/app/feature/feed/api/feedApi.server";
import AppShell from "@/app/feature/AppShell";
import { UserProvider } from "@/app/share/providers/UserProvider";

export default async function HomePage() {
  const currentUser = await fetchCurrentUserServer();

  if (currentUser) {
    return (
      <UserProvider user={currentUser}>
        <AppShell>
          <FeedPage />
        </AppShell>
      </UserProvider>
    );
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
          <div className="w-full max-w-lg space-y-6">
            <div className="space-y-3 lg:hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-foreground-muted">
                Welcome back
              </p>
              <h1 className="text-3xl font-semibold leading-tight text-foreground">
                Your feed gets better once it knows who you are.
              </h1>
              <p className="text-sm text-foreground-muted">
                Sign in to see your personalized home, catch up with friends,
                and jump back into conversations.
              </p>
            </div>

            <LoginForm />
          </div>
        </section>
      </div>
    </div>
  );
}
