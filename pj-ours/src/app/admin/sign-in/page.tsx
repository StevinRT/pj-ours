import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import AdminSignInForm from "./sign-in-form";

export default async function AdminSignInPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-10 text-white">
      <div className="mx-auto w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Admin login</p>
        <h1 className="mt-2 text-3xl font-bold">Sign in to PJ Ours admin</h1>
        <p className="mt-3 text-zinc-300">
          Use your Supabase admin credentials to access the protected area.
        </p>
        <div className="mt-6">
          <AdminSignInForm />
        </div>
      </div>
    </main>
  );
}
