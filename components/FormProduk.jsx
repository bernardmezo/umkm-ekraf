"use client";

import { useState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { buatDeskripsiAIAction } from "@/app/admin/actions";

// Dipakai untuk tambah produk (US-08) dan ubah produk (US-09). Keduanya bonus di jalur offline.
// Nama field sama dengan kolom tabel "produk".
export default function FormProduk({ produk = {}, labelTombol, action }) {
  const [nama, setNama] = useState(produk.nama || "");
  const [kategori, setKategori] = useState(produk.kategori || "");
  const [deskripsi, setDeskripsi] = useState(produk.deskripsi || "");
  const [loadingAI, setLoadingAI] = useState(false);
  const [pesanAI, setPesanAI] = useState(null);

  async function handleBuatDeskripsiAI() {
    if (!nama.trim()) {
      setPesanAI({ tipe: "error", teks: "Isi nama produk terlebih dahulu." });
      return;
    }

    setLoadingAI(true);
    setPesanAI(null);

    try {
      const res = await buatDeskripsiAIAction({ nama, kategori });
      if (res.error) {
        setPesanAI({ tipe: "error", teks: res.error });
      } else if (res.deskripsi) {
        setDeskripsi(res.deskripsi);
        setPesanAI({
          tipe: "sukses",
          teks: "Deskripsi berhasil dibuat dengan AI!",
        });
      }
    } catch (err) {
      setPesanAI({ tipe: "error", teks: err.message });
    } finally {
      setLoadingAI(false);
    }
  }

  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      {produk.id && <input type="hidden" name="id" value={produk.id} />}
      <Input
        label="Nama produk"
        name="nama"
        value={nama}
        onChange={(e) => setNama(e.target.value)}
        required
      />
      <Input
        label="Harga (Rp)"
        name="harga"
        type="number"
        min="0"
        defaultValue={produk.harga}
        required
      />
      <Input
        label="Kategori"
        name="kategori"
        value={kategori}
        onChange={(e) => setKategori(e.target.value)}
      />
      <Input
        label="Link foto"
        name="foto_url"
        placeholder="https://... atau /produk/nama-file.svg"
        defaultValue={produk.foto_url}
      />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Deskripsi</span>
          <button
            type="button"
            onClick={handleBuatDeskripsiAI}
            disabled={loadingAI}
            className="inline-flex items-center gap-1.5 rounded-md border border-garis bg-permukaan px-2.5 py-1 text-xs font-semibold text-utama hover:bg-garis disabled:opacity-50"
          >
            {loadingAI ? "Sedang membuat..." : "✨ Buat deskripsi dengan AI"}
          </button>
        </div>
        {pesanAI && (
          <p
            className={`text-xs ${
              pesanAI.tipe === "error" ? "text-bahaya" : "text-utama"
            }`}
          >
            {pesanAI.teks}
          </p>
        )}
        <Input
          name="deskripsi"
          textarea
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
        />
      </div>

      <div className="flex gap-3">
        <Tombol type="submit">{labelTombol}</Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}
