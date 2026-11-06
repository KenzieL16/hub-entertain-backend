# HubEntertain Backend

REST API untuk HubEntertain: **Express 5 + MongoDB (Mongoose) + JWT**.

## Menjalankan

```bash
npm install
cp .env.example .env      # isi MONGODB_URI dan JWT_SECRET
npm run seed              # isi data awal (kategori, konten, akun demo, review)
npm run dev               # http://localhost:5000
```

| Script | Fungsi |
|---|---|
| `npm run dev` | Jalankan dengan auto-reload |
| `npm start` | Jalankan (production) |
| `npm run seed` | Import data awal. Aman dijalankan berulang (upsert berdasarkan slug) |
| `npm run seed:destroy` | Hapus kategori, konten, review, dan akun demo (user asli tidak dihapus) |

Akun demo setelah seed: `jordan.davis@email.com` / `Password123` (ubah lewat `SEED_DEMO_PASSWORD`).

Mengubah data awal: edit `src/data/dummyData.js` (film, serial, musik) atau `src/data/categories.js`, lalu `npm run seed` lagi.

## Endpoint

Semua di bawah `/api`. Token dikirim lewat header `Authorization: Bearer <token>`.

### Auth
| Method | Path | Body | Keterangan |
|---|---|---|---|
| POST | `/auth/register` | `fullName, email, password, confirmPassword` | Password min. 8 karakter dan mengandung angka. Respons `201 { user, token }` |
| POST | `/auth/login` | `email, password, rememberMe?` | `rememberMe: true` membuat token berlaku 30 hari (default 1 hari). Respons `{ user, token }` |
| GET | `/auth/me` | | Butuh token. Respons `{ user }` |

### Home, kategori, konten
| Method | Path | Keterangan |
|---|---|---|
| GET | `/home?limit=10` | `{ hero, sections: [{ slug, title, ..., items }] }` untuk halaman Home |
| GET | `/categories` | Daftar kategori |
| GET | `/categories/:slug?genre=&sort=&page=&limit=` | `sort`: `rating` \| `newest` \| `title`. Respons `{ category, genres, items, pagination }` |
| GET | `/contents/search?q=` | Cari judul, artis, atau genre. Respons `{ query, total, results }` |
| GET | `/contents/:slug` | Detail konten. Respons `{ content }` |

Slug kategori: `movies`, `series`, `music`. `id` konten = slug, mis. `interstellar`.

### Komentar (review)
| Method | Path | Body | Keterangan |
|---|---|---|---|
| GET | `/contents/:slug/reviews?page=&limit=` | | Publik. Respons `{ summary: { count, average }, reviews, pagination }`; `isMine` terisi bila token dikirim |
| POST | `/contents/:slug/reviews` | `rating (1-5), comment (maks 1000), title?` | Butuh token. Satu user satu review per konten (409 jika sudah ada) |
| PATCH | `/reviews/:id` | salah satu field di atas | Hanya pemilik (atau admin) |
| DELETE | `/reviews/:id` | | Hanya pemilik (atau admin) |

Error selalu berbentuk `{ message, errors? }`; `errors` berisi `[{ field, message }]` untuk validasi.

## Catatan integrasi frontend

- `credits` sekarang `[{ label, value }]`, bukan `[[label, value]]`: `item.credits.map(({ label, value }) => ...)`.
- `subtitle`, `type`, `breadcrumb`, dan `ratingsCount` dihitung server, jadi `cat.subtitle(item)` di frontend diganti `item.subtitle`.
- Waktu review ada di `createdAt` (ISO). Ubah jadi "3 days ago" di frontend.
- Simpan `token` (mis. `localStorage`), kirim di header Authorization, dan hapus saat logout atau jika API membalas 401.
