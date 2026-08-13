import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const requireAdminClient = async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/admin/sign-in?next=/admin");
  }

  return supabase;
};
