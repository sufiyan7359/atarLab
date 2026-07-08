/** Inserts a Cloudinary on-the-fly transform (width + auto format/quality) into a
 *  secure_url delivery URL. Returns the URL unchanged for anything else (picsum seed
 *  images, local-disk uploads) so this is safe to apply universally. */
export function cloudinaryWidth(url: string, width: number): string {
  const marker = '/image/upload/';
  const cutAt = url.indexOf(marker);
  if (cutAt === -1) return url;
  const insertAt = cutAt + marker.length;
  return `${url.slice(0, insertAt)}w_${width},q_auto,f_auto/${url.slice(insertAt)}`;
}

/** Builds a srcset string for the given widths, e.g. "url?w=300 300w, url?w=600 600w". */
export function cloudinarySrcset(url: string, widths: number[]): string {
  return widths.map((w) => `${cloudinaryWidth(url, w)} ${w}w`).join(', ');
}
