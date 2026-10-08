import Link from "next/link";
import KartuProduk from "@/components/KartuProduk";
import { toko } from "@/lib/toko";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanKatalog({ searchParams }) {
  const params = (await searchParams) || {};
  const q = params.q ? String(params.q).trim() : "";
  const kategoriAktif = params.kategori ? String(params.kategori).trim() : "";

  let daftarProduk = [];
  let daftarKategori = [];
  let pesanError = null;

  try {
    const supabase = createServerClient();

    // Ambil daftar kategori unik
    const { data: dataKategori } = await supabase
      .from("produk")
      .select("kategori");

    if (dataKategori) {
      daftarKategori = Array.from(
        new Set(dataKategori.map((item) => item.kategori).filter(Boolean))
      );
    }

    // Ambil daftar produk sesuai filter & search
    let query = supabase
      .from("produk")
      .select("*")
      .order("created_at", { ascending: true });

    if (q) {
      query = query.ilike("nama", `%${q}%`);
    }

    if (kategoriAktif) {
      query = query.eq("kategori", kategoriAktif);
    }

    const { data, error } = await query;

    if (error) {
      pesanError = `Gagal memuat produk: ${error.message}`;
    } else {
      daftarProduk = data || [];
    }
  } catch (err) {
    pesanError = `Gagal memuat produk: ${err.message}`;
  }

  const adaFilter = Boolean(q || kategoriAktif);

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      <section aria-labelledby="judul-produk" className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="judul-produk" className="text-xl font-bold">
            Produk kami
          </h2>

          <form method="GET" action="/" className="flex max-w-md items-center gap-2">
            {kategoriAktif && (
              <input type="hidden" name="kategori" value={kategoriAktif} />
            )}
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Cari nama produk..."
              className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-utama px-4 py-2 text-sm font-semibold text-white hover:bg-utama-gelap"
            >
              Cari
            </button>
            {adaFilter && (
              <Link
                href="/"
                className="inline-flex shrink-0 items-center justify-center rounded-lg border border-garis bg-latar px-3 py-2 text-sm font-semibold text-teks hover:border-utama hover:text-utama"
              >
                Reset
              </Link>
            )}
          </form>
        </div>

        {daftarKategori.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={q ? `/?q=${encodeURIComponent(q)}` : "/"}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                !kategoriAktif
                  ? "bg-utama text-white"
                  : "border border-garis bg-permukaan text-teks hover:border-utama"
              }`}
            >
              Semua
            </Link>
            {daftarKategori.map((kategori) => {
              const aktif = kategoriAktif === kategori;
              const link = `/?kategori=${encodeURIComponent(kategori)}${
                q ? `&q=${encodeURIComponent(q)}` : ""
              }`;
              return (
                <Link
                  key={kategori}
                  href={link}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    aktif
                      ? "bg-utama text-white"
                      : "border border-garis bg-permukaan text-teks hover:border-utama"
                  }`}
                >
                  {kategori}
                </Link>
              );
            })}
          </div>
        )}

        {pesanError ? (
          <p className="rounded-xl border border-garis bg-permukaan p-4 text-sm text-bahaya">
            {pesanError}
          </p>
        ) : daftarProduk.length === 0 ? (
          <p className="rounded-xl border border-garis bg-permukaan p-6 text-center text-sm text-teks-lembut">
            {adaFilter
              ? "Tidak ada produk yang cocok dengan pencarian atau filter Anda."
              : "Belum ada produk"}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {daftarProduk.map((produk) => (
              <KartuProduk key={produk.id} produk={produk} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
