"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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

export async function tambahProdukAction(formData) {
  const { supabase } = await requireAuth();

  const nama = formData.get("nama")?.toString().trim();
  const harga = parseInt(formData.get("harga"), 10);
  const kategori = formData.get("kategori")?.toString().trim() || null;
  const foto_url = formData.get("foto_url")?.toString().trim() || null;
  const deskripsi = formData.get("deskripsi")?.toString().trim() || null;

  if (!nama) {
    throw new Error("Nama produk wajib diisi.");
  }

  if (isNaN(harga) || harga < 0) {
    throw new Error("Harga harus berupa angka valid dan minimal 0.");
  }

  const { error } = await supabase.from("produk").insert({
    nama,
    harga,
    kategori,
    foto_url,
    deskripsi,
  });

  if (error) {
    throw new Error(`Gagal menambah produk: ${error.message}`);
  }

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

export async function ubahProdukAction(formData) {
  const { supabase } = await requireAuth();

  const id = formData.get("id");
  const nama = formData.get("nama")?.toString().trim();
  const harga = parseInt(formData.get("harga"), 10);
  const kategori = formData.get("kategori")?.toString().trim() || null;
  const foto_url = formData.get("foto_url")?.toString().trim() || null;
  const deskripsi = formData.get("deskripsi")?.toString().trim() || null;

  if (!id) {
    throw new Error("ID produk tidak valid.");
  }

  if (!nama) {
    throw new Error("Nama produk wajib diisi.");
  }

  if (isNaN(harga) || harga < 0) {
    throw new Error("Harga harus berupa angka valid dan minimal 0.");
  }

  const { error } = await supabase
    .from("produk")
    .update({
      nama,
      harga,
      kategori,
      foto_url,
      deskripsi,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Gagal mengubah produk: ${error.message}`);
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath(`/produk/${id}`);
  redirect("/admin");
}

export async function hapusProdukAction(formData) {
  const { supabase } = await requireAuth();
  const id = formData.get("id");

  if (!id) {
    throw new Error("ID produk tidak valid.");
  }

  const { error } = await supabase.from("produk").delete().eq("id", id);

  if (error) {
    throw new Error(`Gagal menghapus produk: ${error.message}`);
  }

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

export async function buatDeskripsiAIAction({ nama, kategori }) {
  await requireAuth();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      error:
        "GEMINI_API_KEY belum dikonfigurasi di environment variable (.env.local).",
    };
  }

  if (!nama || !nama.trim()) {
    return {
      error: "Nama produk harus diisi terlebih dahulu untuk membuat deskripsi AI.",
    };
  }

  const prompt = `Buatkan deskripsi produk UMKM dalam bahasa Indonesia yang menarik, ringkas (2-3 kalimat), dan persuasif untuk promosi WhatsApp.
Nama Produk: ${nama}
${kategori ? `Kategori: ${kategori}` : ""}
Hasilkan hanya teks deskripsi saja tanpa tanda kutip, format markdown tebal, atau teks pembuka.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        error:
          errorData.error?.message ||
          `Gagal menghubungi Gemini API (Status ${res.status}).`,
      };
    }

    const data = await res.json();
    const deskripsi =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!deskripsi) {
      return { error: "Gemini API tidak mengembalikan deskripsi." };
    }

    return { deskripsi };
  } catch (err) {
    return { error: `Terjadi kesalahan saat memanggil AI: ${err.message}` };
  }
}
