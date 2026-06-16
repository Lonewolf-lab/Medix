export const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB — matches backend multipart limit

/** "2.4 MB" */
export function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function isPdf(fileType = '', fileName = '') {
  return /pdf/i.test(fileType) || /\.pdf$/i.test(fileName)
}

export function isImage(fileType = '', fileName = '') {
  return /image\//i.test(fileType) || /\.(png|jpe?g|gif|webp)$/i.test(fileName)
}

/** Human-readable reason a dropped file was rejected, or null if it's fine. */
export function validateFile(file) {
  if (!file) return 'No file selected.'
  if (file.size > MAX_FILE_SIZE) return 'File is larger than 10 MB.'
  const okType = Object.keys(ACCEPTED_FILE_TYPES).includes(file.type)
  if (!okType) return 'Only PDF, JPG, and PNG files are supported.'
  return null
}
