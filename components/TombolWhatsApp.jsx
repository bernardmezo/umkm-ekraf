"use client";

import { useState } from "react";
import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";

export default function TombolWhatsApp({ produk }) {
  const [jumlah, setJumlah] = useState(1);
  const [catatan, setCatatan] = useState("");

  const totalHarga = (produk.harga || 0) * jumlah;

  let pesan = `Halo, saya ingin memesan ${produk.nama} sebanyak ${jumlah} buah dengan total ${formatRupiah(totalHarga)}.`;
  if (catatan.trim()) {
    pesan += ` Catatan/varian: ${catatan.trim()}`;
  }

  const linkWhatsApp = `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(pesan)}`;

  function kurang() {
    if (jumlah > 1) setJumlah((prev) => prev - 1);
  }

  function tambah() {
    setJumlah((prev) => prev + 1);
  }

  return (
    <div className="flex flex-col gap-4 border-t border-garis pt-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold">Jumlah pesanan</label>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center rounded-lg border border-garis bg-latar">
            <button
              type="button"
              onClick={kurang}
              disabled={jumlah <= 1}
              className="flex h-10 w-10 items-center justify-center rounded-l-lg text-lg font-bold text-teks hover:bg-permukaan disabled:opacity-40"
              aria-label="Kurangi jumlah"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={jumlah}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setJumlah(isNaN(val) || val < 1 ? 1 : val);
              }}
              className="h-10 w-14 text-center text-sm font-semibold text-teks focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={tambah}
              className="flex h-10 w-10 items-center justify-center rounded-r-lg text-lg font-bold text-teks hover:bg-permukaan"
              aria-label="Tambah jumlah"
            >
              +
            </button>
          </div>
          <div className="text-sm">
            <span className="text-teks-lembut">Total: </span>
            <span className="font-bold text-harga">{formatRupiah(totalHarga)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold">
          Catatan / varian <span className="text-xs font-normal text-teks-lembut">(opsional)</span>
        </label>
        <input
          type="text"
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="Contoh: rasa pedas manis / ukuran L"
          className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
        />
      </div>

      <a
        href={linkWhatsApp}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap sm:w-auto"
      >
        Pesan via WhatsApp
      </a>
    </div>
  );
}
