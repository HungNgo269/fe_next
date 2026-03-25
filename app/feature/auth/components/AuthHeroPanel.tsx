import Image from "next/image";

type AuthHeroPanelProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export default function AuthHeroPanel({
  eyebrow,
  title,
  description,
}: AuthHeroPanelProps) {
  return (
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
          {eyebrow}
        </p>
        <h1 className="text-4xl font-semibold leading-tight">{title}</h1>
        <p className="text-sm text-white/80">{description}</p>
      </div>
    </section>
  );
}
