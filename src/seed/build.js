import { heroSlug, movies, music, tvShows } from '../data/dummyData.js';
import { art } from './placeholder.js';

const toCredits = (credits = []) => credits.map(([label, value]) => ({ label, value }));

const build = (items, category, defaults, size) =>
  items.map(({ id, credits, ...item }, order) => ({
    category,
    order,
    slug: id,
    isHero: id === heroSlug,
    image: art(item.title, ...size),
    ...defaults(item),
    ...item,
    credits: toCredits(credits ?? defaults(item).credits),
  }));

/** Mengubah dummy data menjadi dokumen Content siap simpan. */
export const buildContents = () => [
  ...build(movies, 'movies', () => ({ tag: 'MOVIE', badge: '4K UHD', trailerTime: '2:30' }), [400, 600]),
  ...build(tvShows, 'series', () => ({ tag: 'TV SHOW', badge: 'HD', trailerTime: '1:45' }), [400, 600]),
  ...build(
    music,
    'music',
    (m) => ({
      tag: `MUSIC • ${m.info.toUpperCase()}`,
      badge: 'LOSSLESS AUDIO',
      trailerTime: '3:30',
      credits: [['Artist', m.artist], ['Genre', m.genres.join(' • ')]],
    }),
    [400, 400]
  ),
];
