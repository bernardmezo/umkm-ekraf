# Jurnal Prompt

Catat prompt penting selama membangun aplikasi: apa yang kamu minta, hasilnya, dan perbaikan yang dilakukan. Beri tanda **[SENDIRI]** untuk prompt yang kamu tulis sendiri (bukan dari lembar kerja).

## US-01 Katalog dari database

**Prompt:**
Baca AGENTS.md dan docs/user-stories.md bagian US-01.

Ubah app/page.jsx supaya daftar produk diambil dari tabel "produk" di Supabase, di sisi server, memakai SUPABASE_URL dan SUPABASE_SECRET_KEY dari environment variable. Buat koneksi Supabase untuk server di folder lib/supabase.

Tampilkan produk dengan komponen KartuProduk yang sudah ada, tanpa mengubah tampilannya. Kalau gagal mengambil data, tampilkan pesan error yang jelas di halaman. Kalau tabel kosong, tampilkan tulisan "Belum ada produk". Hapus CatatanBelumAktif dari halaman ini.

**Hasil:**
- Dibuat modul koneksi server Supabase di `lib/supabase/server.js` dan diekspor melalui `lib/supabase/index.js` menggunakan `SUPABASE_URL` dan `SUPABASE_SECRET_KEY`.
- Halaman katalog `app/page.jsx` diperbarui untuk mengambil seluruh data produk dari tabel `produk` di Supabase secara server-side.
- Data produk dirender menggunakan komponen `KartuProduk`.
- Ditambahkan penanganan kondisi error dengan menampilkan pesan kesalahan yang jelas, dan penanganan kondisi tabel kosong dengan tulisan "Belum ada produk".
- Komponen `CatatanBelumAktif` dihapus dari halaman katalog.

**Perbaikan:**
- Menggantikan sumber data tiruan dari `lib/data-contoh.js` dengan data dinamis langsung dari database Supabase.
- Menambahkan fallback state untuk data kosong dan pesan error ketika koneksi database bermasalah.
- Menambahkan konfigurasi `export const dynamic = "force-dynamic"` agar data selalu segar saat diakses.

## US-02 Detail produk

**Prompt:**
Baca docs/user-stories.md bagian US-02.

Ubah app/produk/[id]/page.jsx supaya mengambil satu produk dari tabel "produk" di Supabase berdasarkan id di URL, di sisi server, memakai koneksi Supabase yang sudah dibuat di lib/supabase. Kalau produk tidak ditemukan, panggil notFound(). Jangan ubah tampilannya. Hapus CatatanBelumAktif dari halaman ini, tapi biarkan tombol WhatsApp.

**Hasil:**
- Halaman `app/produk/[id]/page.jsx` mengambil data satu produk berdasarkan `id` dari tabel `produk` di Supabase via server-side query `.eq("id", id).maybeSingle()`.
- Jika produk tidak ditemukan atau terjadi error, fungsi `notFound()` dari Next.js dipanggil untuk menampilkan halaman 404.
- Tampilan detail produk (foto, kategori, nama, harga, deskripsi) tetap utuh sesuai desain awal.
- Tombol WhatsApp tetap dipertahankan dan komponen `CatatanBelumAktif` dihapus dari halaman detail.

**Perbaikan:**
- Mengganti pencarian data lokal `cariProdukContoh(id)` dengan query database Supabase secara aman di sisi server.
- Menyesuaikan penanganan `await params` sesuai aturan Next.js 16.

## US-03 Pesan via WhatsApp

**Prompt:**
Baca docs/rancangan-teknis.md bagian "Pesan WhatsApp (US-03)".

Ubah components/TombolWhatsApp.jsx menjadi tautan yang membuka https://wa.me/ ke nomor di lib/toko.js, dengan pesan otomatis berisi nama dan harga produk dalam format rupiah. Pesan di-encode dengan encodeURIComponent dan dibuka di tab baru. Pertahankan tampilan tombolnya. Hapus CatatanBelumAktif yang menyebut US-03 di halaman detail produk.

**Hasil:**
- Komponen `components/TombolWhatsApp.jsx` diubah dari elemen button biasa menjadi tautan `<a>` yang mengarah ke `https://wa.me/<nomor>?text=<pesan>`.
- Nomor telepon tujuan diambil dari konfigurasi `lib/toko.js`.
- Teks pesan pesanan diisi otomatis dengan format nama dan harga produk dalam rupiah, lalu di-encode menggunakan `encodeURIComponent`.
- Tautan membuka tab baru dengan atribut `target="_blank"` dan `rel="noopener noreferrer"`.
- Gaya visual tombol tetap konsisten dengan desain sebelumnya.

**Perbaikan:**
- Mengaktifkan fungsi pemesanan langsung ke WhatsApp toko dengan pesan otomatis sehingga pembeli tidak perlu mengetik manual.

## US-04 Login admin

**Prompt:**
Baca AGENTS.md bagian aturan keamanan dan docs/user-stories.md bagian US-04.

Buat login admin memakai Supabase Auth (email dan password) dengan @supabase/ssr dan cookie, memakai SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY. Login diproses dengan Server Action di app/admin/actions.js dan disambungkan ke form di app/admin/login/page.jsx. Login berhasil diarahkan ke /admin; login gagal menampilkan pesan error yang jelas di halaman login. Buat juga tombol "Keluar" di components/NavAdmin.jsx berfungsi: mengakhiri sesi lalu kembali ke /admin/login. Jangan ubah tampilan. Hapus CatatanBelumAktif dari halaman login.

**Hasil:**
- Dibuat helper `createSessionClient` di `lib/supabase/server.js` memanfaatkan `@supabase/ssr` dan cookie store Next.js.
- Dibuat Server Action `loginAction` dan `logoutAction` di `app/admin/actions.js`.
- Halaman `app/admin/login/page.jsx` disambungkan ke `loginAction` menggunakan hook `useActionState`, menampilkan pesan kesalahan jika autentikasi gagal, dan mengarahkan ke `/admin` saat berhasil.
- Tombol "Keluar" di `components/NavAdmin.jsx` difungsikan dengan memicu `logoutAction` untuk menghapus sesi dan kembali ke `/admin/login`.
- Komponen `CatatanBelumAktif` dihapus dari halaman login.

**Perbaikan:**
- Mengubah form login statis menjadi sistem autentikasi nyata berbasis sesi cookie di sisi server.
- Mengaktifkan fungsi logout untuk manajemen sesi admin yang aman.

## US-05 Ganti password

**Prompt:**
Baca docs/user-stories.md bagian US-05.

Buat Server Action ganti password di app/admin/actions.js untuk admin yang sedang login, memakai Supabase Auth. Validasi di server: password baru minimal 8 karakter dan harus sama dengan konfirmasi. Tampilkan pesan berhasil atau pesan error yang jelas di halaman. Sambungkan ke form di app/admin/password/page.jsx tanpa mengubah tampilannya. Hapus CatatanBelumAktif dari halaman ini.

**Hasil:**
- Ditambahkan Server Action `gantiPasswordAction` di `app/admin/actions.js` menggunakan `supabase.auth.updateUser`.
- Diterapkan validasi sisi server: memastikan sesi admin aktif, password minimal 8 karakter, dan password baru identik dengan konfirmasi password.
- Form di `app/admin/password/page.jsx` disambungkan ke Server Action menggunakan `useActionState`, menampilkan indikator sukses atau pesan error.
- Komponen `CatatanBelumAktif` dihapus dari halaman ganti password.

**Perbaikan:**
- Mengaktifkan pembaruan kredensial admin secara langsung ke Supabase Auth dengan proteksi validasi server.

## US-06 Proteksi halaman admin

**Prompt:**
Baca AGENTS.md aturan keamanan nomor 3 dan 4, dan docs/user-stories.md bagian US-06.

Buat file proxy.js di root proyek (Next.js 16). Semua rute /admin kecuali /admin/login wajib login dengan Supabase Auth; kalau belum login, alihkan ke /admin/login. Pastikan juga setiap Server Action yang mengubah data memeriksa login di server. Hapus CatatanBelumAktif dari halaman /admin.

**Hasil:**
- Dibuat file `proxy.js` di root proyek sebagai pengganti middleware di Next.js 16 untuk memvalidasi sesi cookie pengguna pada setiap request rute `/admin/*`.
- Pengguna yang belum terautentikasi otomatis dialihkan ke `/admin/login`.
- Dibuat fungsi pembantu `requireAuth` di `app/admin/actions.js` untuk memverifikasi autentikasi sebelum Server Action pengubah data dijalankan.
- Komponen `CatatanBelumAktif` dihapus dari `app/admin/page.jsx`.

**Perbaikan:**
- Mengamankan seluruh rute panel admin dari akses publik tidak berizin.
- Menjamin kepatuhan aturan keamanan nomor 3 dan 4 pada AGENTS.md.

## Debugging dan fitur bonus

### US-07 List Produk Admin dari Database

**Prompt:**
Kerjakan US-07: List produk di halaman admin dari database sesuai panduan di AGENTS.md, docs/user-stories.md, dan docs/rancangan-teknis.md.

**Hasil:**
- Mengubah `app/admin/page.jsx` menjadi Server Component async.
- Mengambil daftar produk dari tabel `produk` di Supabase via `createSessionClient`.
- Menampilkan data menggunakan komponen `TabelProduk`, dengan penanganan error dan fallback saat daftar kosong.

**Perbaikan:**
- Menghapus import data tiruan `produkContoh` dari `lib/data-contoh.js`.
- Menampilkan data produk dinamis secara real-time di dashboard admin.

### US-08 Tambah Produk

**Prompt:**
Kerjakan US-08: Tambah produk (harus terkunci login) sesuai panduan di AGENTS.md, docs/user-stories.md, docs/rancangan-teknis.md, dan DESIGN.md.

**Hasil:**
- Dibuat Server Action `tambahProdukAction` di `app/admin/actions.js` dengan proteksi autentikasi `requireAuth()`.
- Validasi data input form (`nama`, `harga >= 0`, `kategori`, `foto_url`, `deskripsi`).
- Menambahkan produk ke database Supabase dan memicu `revalidatePath` untuk `/admin` dan `/`.
- Menghubungkan form di `app/admin/produk/baru/page.jsx` dan menghapus `CatatanBelumAktif`.

**Perbaikan:**
- Mengaktifkan penambahan produk baru ke database oleh admin terotentikasi.

### US-09 Ubah Produk

**Prompt:**
Kerjakan US-09: Ubah produk (harus terkunci login) sesuai panduan di AGENTS.md, docs/user-stories.md, docs/rancangan-teknis.md, dan DESIGN.md.

**Hasil:**
- Di `app/admin/produk/[id]/ubah/page.jsx`, mengambil data produk lama dari Supabase berdasarkan parameter dinamis `id` (`await params`).
- Mengisi form secara otomatis dengan data lama via `components/FormProduk.jsx`.
- Dibuat Server Action `ubahProdukAction` di `app/admin/actions.js` dengan proteksi `requireAuth()`.
- Menyimpan perubahan ke tabel `produk`, merevalidasi cache, dan kembali ke `/admin`.
- Menghapus `CatatanBelumAktif` dari halaman ubah produk.

**Perbaikan:**
- Mengganti pencarian data lokal dengan query database Supabase dan mengaktifkan pengeditan produk.

### US-10 Hapus Produk

**Prompt:**
Kerjakan US-10: Hapus produk (harus terkunci login) sesuai panduan di AGENTS.md, docs/user-stories.md, docs/rancangan-teknis.md, dan DESIGN.md.

**Hasil:**
- Dibuat Server Action `hapusProdukAction` di `app/admin/actions.js` yang mewajibkan sesi admin (`requireAuth()`).
- Dibuat komponen klien `components/TombolHapus.jsx` dengan konfirmasi browser (`confirm(...)`) sebelum menjalankan aksi hapus.
- Menghapus baris produk dari database Supabase dan merevalidasi cache `/admin` dan `/`.

**Perbaikan:**
- Mengaktifkan fungsionalitas hapus produk pada tabel admin yang dilengkapi konfirmasi dialog demi mencegah penghapusan tidak disengaja.

### US-11 Filter Kategori dan Pencarian

**Prompt:**
Kerjakan US-11: Filter kategori atau pencarian sesuai panduan di AGENTS.md, docs/user-stories.md, docs/rancangan-teknis.md, dan DESIGN.md.

**Hasil:**
- Memperbarui `app/page.jsx` untuk menangani `searchParams` (`q` dan `kategori`).
- Menyaring query Supabase dengan `.ilike('nama', ...)` dan `.eq('kategori', ...)`.
- Menambahkan bilah pencarian dan tombol filter kategori dinamis beserta opsi reset.

**Perbaikan:**
- Memberikan kemudahan pengunjung mencari nama produk dan memfilter kategori produk secara cepat di katalog.

### US-12 Pemilihan Jumlah dan Varian Produk

**Prompt:**
Kerjakan US-12: Pilih jumlah atau varian sesuai panduan di AGENTS.md, docs/user-stories.md, docs/rancangan-teknis.md, dan DESIGN.md.

**Hasil:**
- Mengembangkan `components/TombolWhatsApp.jsx` menjadi komponen interaktif dengan kontrol jumlah (+/- dan input angka), kalkulasi total harga otomatis, serta input catatan/varian.
- Pesan WhatsApp diperbarui secara dinamis memuat jumlah pesanan, total harga, dan catatan varian.

**Perbaikan:**
- Memudahkan pembeli memesan produk dalam jumlah tertentu dan varian khusus secara instan lewat WhatsApp.

### US-13 Progressive Web App (PWA)

**Prompt:**
Kerjakan US-13: Bisa di-install di HP (PWA) sesuai panduan di AGENTS.md, docs/user-stories.md, docs/rancangan-teknis.md, dan DESIGN.md.

**Hasil:**
- Membuat file `app/manifest.js` standar Next.js App Router dengan metadata nama toko, tema warna, dan ikon PWA dari `public/icons/`.
- Memperbarui `app/layout.jsx` dengan meta tag `appleWebApp` dan `viewport.themeColor`.

**Perbaikan:**
- Mengizinkan aplikasi dipasang (Add to Home Screen) pada perangkat smartphone layaknya aplikasi native.

### US-14 Deskripsi Produk Dibuat AI (Gemini)

**Prompt:**
Kerjakan US-14: Deskripsi produk dibuat AI sesuai panduan di AGENTS.md, docs/user-stories.md, docs/rancangan-teknis.md, dan DESIGN.md.

**Hasil:**
- Dibuat Server Action `buatDeskripsiAIAction` di `app/admin/actions.js` yang memanggil Google Gemini API melalui native `fetch` dengan kunci `process.env.GEMINI_API_KEY` dan proteksi sesi admin (`requireAuth()`).
- Menambahkan tombol interaktif "✨ Buat deskripsi dengan AI" di `components/FormProduk.jsx` dengan indikator loading dan pengisian otomatis ke textarea deskripsi.
- Menambahkan dokumentasi variabel `GEMINI_API_KEY` di `.env.example`.

**Perbaikan:**
- Membantu pemilik toko menyusun narasi deskripsi produk persuasif secara instan menggunakan kecerdasan buatan.
