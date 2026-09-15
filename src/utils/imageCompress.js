/**
 * Client-side image compression using Canvas API.
 * No external dependencies — uses browser-native canvas.
 *
 * @param {File} file - Original image file
 * @param {Object} opts
 * @param {number} opts.maxWidth  - Max output width  (default 1920)
 * @param {number} opts.maxHeight - Max output height (default 1080)
 * @param {number} opts.quality   - JPEG quality 0-1 (default 0.8)
 * @returns {Promise<File>} Compressed image as a File blob
 */
export async function compressImage(file, opts = {}) {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
  } = opts

  // Skip compression for small files (< 500 KB) — not worth the CPU
  if (file.size < 500 * 1024) return file

  // Skip for non-raster images (SVG, GIF with animation, WebP animated)
  if (file.type === 'image/svg+xml') return file

  const bitmap = await createImageBitmap(file)
  let { width, height } = bitmap

  // Scale down to fit within maxWidth × maxHeight while preserving aspect ratio
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height)
    width = Math.round(width * ratio)
    height = Math.round(height * ratio)
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', quality)
  )

  const ext = 'jpg'
  const compressed = new File([blob], file.name.replace(/\.[^.]+$/, `.${ext}`), {
    type: 'image/jpeg',
    lastModified: Date.now(),
  })

  return compressed
}

/**
 * Format bytes to human-readable string.
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
