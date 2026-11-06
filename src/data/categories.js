/** Sumber tunggal kategori (di-seed ke koleksi `categories`). Key = slug di URL frontend. */
export const categories = [
  {
    slug: 'movies',
    title: 'Popular Movies',
    pageTitle: 'Movies',
    typeLabel: 'Movies',
    description: 'Film terbaik sepanjang masa, dari blockbuster sampai animasi.',
    square: false,
    showPlay: false,
    order: 1,
  },
  {
    slug: 'series',
    title: 'Trending TV Shows',
    pageTitle: 'TV Shows',
    typeLabel: 'TV Shows',
    description: 'Serial yang bikin lupa waktu, dari kriminal sampai anime.',
    square: false,
    showPlay: false,
    order: 2,
  },
  {
    slug: 'music',
    title: 'Top Music Hits',
    pageTitle: 'Music',
    typeLabel: 'Music',
    description: 'Album dan single dari berbagai genre dan negara.',
    square: true,
    showPlay: true,
    order: 3,
  },
];

export const categoryBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

/** Teks kecil di bawah judul kartu (dulu `subtitle` di frontend). */
export const subtitleFor = (item) => {
  switch (item.category) {
    case 'movies': return `${item.year} • ${item.genre}`;
    case 'series': return item.info;
    case 'music': return `${item.artist} • ${item.year}`;
    default: return String(item.year ?? '');
  }
};
