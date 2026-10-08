"use client";

import Tombol from "@/components/Tombol";
import { hapusProdukAction } from "@/app/admin/actions";

export default function TombolHapus({ id, nama }) {
  function handleSubmit(e) {
    if (!confirm(`Yakin ingin menghapus produk "${nama}"?`)) {
      e.preventDefault();
    }
  }

  return (
    <form action={hapusProdukAction} onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={id} />
      <Tombol type="submit" varian="bahaya">
        Hapus
      </Tombol>
    </form>
  );
}
