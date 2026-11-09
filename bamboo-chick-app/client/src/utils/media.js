const apiSetting = import.meta.env.VITE_API_URL || '/api';
const apiOrigin = /^https?:\/\//i.test(apiSetting)
  ? new URL(apiSetting).origin
  : '';

/** Resolve product media from either the public product folder or the API uploads folder. */
export function mediaUrl(value) {
  if (!value) return '';
  const image = String(value).trim();
  if (/^(https?:)?\/\//i.test(image) || image.startsWith('data:')) return image;
  if (image.startsWith('/uploads/')) return `${apiOrigin}${image}`;
  if (image.startsWith('uploads/')) return `${apiOrigin}/${image}`;
  if (image.startsWith('/')) return image;
  return `/products/${image.split('/').map(encodeURIComponent).join('/')}`;
}
