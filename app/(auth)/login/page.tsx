import Image from "next/image";
import LoginForm from "@/app/feature/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen w-full lg:grid-cols-3">
        <section className="relative hidden overflow-hidden lg:col-span-2 lg:block">
          <Image
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1800&q=80"
            alt="People collaborating in a modern workspace"
            className="object-cover"
            fill
            priority
            sizes="(min-width: 1024px) 66vw, 100vw"
            unoptimized
          />
          <div className="absolute inset-0 bg-auth-hero-overlay" />
          <div className="absolute bottom-10 left-10 right-10 max-w-xl space-y-4 text-white">
            <p className="text-xs font-semibold uppercase -xl text-white/75">
              Welcome back
            </p>
            <h1 className="text-4xl font-semibold leading-tight">
              Join conversations, share moments, and stay connected.
            </h1>
            <p className="text-sm text-white/80">
              Sign in to continue your social experience with stronger contrast
              in both light and dark mode.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-10">
          <LoginForm />
        </section>
      </div>
    </div>
  );
}
