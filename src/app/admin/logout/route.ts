import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function doLogout(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const GET = doLogout;
export const POST = doLogout;
