/** Gambar placeholder (SVG gradasi + inisial) bila item tidak punya `image`. */
export const art = (title, w, h) => {
  const hue = ([...title].reduce((a, c) => a + c.charCodeAt(0), 0) * 7) % 360;
  const initials = title
    .split(/\s+/)
    .filter((word) => /^[A-Za-z0-9]/.test(word))
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="hsl(${hue},70%,48%)"/><stop offset="1" stop-color="hsl(${(hue + 50) % 360},65%,14%)"/>
</linearGradient></defs>
<rect width="100%" height="100%" fill="url(#g)"/>
<text x="50%" y="52%" font-family="Helvetica,Arial,sans-serif" font-weight="800" font-size="${Math.min(w, h) * 0.34}" fill="rgba(255,255,255,0.85)" text-anchor="middle" dominant-baseline="middle">${initials}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
