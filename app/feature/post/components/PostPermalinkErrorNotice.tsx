"use client";

import Link from "next/link";
import { useEffect } from "react";
import { toast } from "sonner";

export default function PostPermalinkErrorNotice() {
  useEffect(() => {
    toast.error("Unable to load post.");
  }, []);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link className="inline-block text-sm underline" href="/">
        Back to home
      </Link>
    </main>
  );
}

