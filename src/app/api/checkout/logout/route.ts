import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  
  // Hapus session token Next Auth
  cookieStore.delete("authjs.session-token");
  cookieStore.delete("__Secure-authjs.session-token");
  
  // Hapus cookie penanda checkout
  cookieStore.delete("checkout_google_sso");
  
  return NextResponse.json({ success: true });
}
