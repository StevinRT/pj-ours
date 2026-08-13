"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function AdminSignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleSignOut = async () => {
    setPending(true);

    const supabase = createClient();
    await supabase.auth.signOut();

    setPending(false);
    router.replace("/admin/sign-in");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={pending}
      className="rounded-full bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Signing out..." : "Sign out"}
    </button>
  );
}
