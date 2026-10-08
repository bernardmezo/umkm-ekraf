"use server";

import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";

export async function requireAuth() {
  const supabase = await createSessionClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Akses ditolak: Anda harus login sebagai admin.");
  }

  return { supabase, user };
}

export async function loginAction(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const email = data?.get("email");
  const password = data?.get("password");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(email).trim(),
    password: String(password),
  });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { error: "Email atau password salah. Silakan periksa kembali." };
    }
    return { error: `Gagal masuk: ${error.message}` };
  }

  redirect("/admin");
}

export async function logoutAction() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function gantiPasswordAction(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const passwordBaru = data?.get("password_baru");
  const konfirmasiPassword = data?.get("konfirmasi_password");

  let supabase;
  try {
    const auth = await requireAuth();
    supabase = auth.supabase;
  } catch {
    return { error: "Sesi telah berakhir. Silakan login kembali." };
  }

  if (!passwordBaru || !konfirmasiPassword) {
    return { error: "Semua kolom password wajib diisi." };
  }

  if (passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Konfirmasi password tidak cocok dengan password baru." };
  }

  const { error } = await supabase.auth.updateUser({
    password: String(passwordBaru),
  });

  if (error) {
    return { error: `Gagal mengganti password: ${error.message}` };
  }

  return { success: true, message: "Password berhasil diganti." };
}
