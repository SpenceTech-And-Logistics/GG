/** Resize an image file to a compact JPEG data URL (stored in Firestore, so no paid Storage is needed). */
export function resizeImage(file, maxSide = 1200, quality = 0.74) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('Please choose an image file.'))
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('That image could not be read.'))
    }
    img.src = url
  })
}

/** Work out how to show a video link: thumbnail and an embeddable address when one exists. */
export function videoInfo(link = '') {
  const url = link.trim()
  let m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{11})/)
  if (m) return { kind: 'youtube', thumb: `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg`, embed: `https://www.youtube-nocookie.com/embed/${m[1]}?rel=0` }
  m = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/)
  if (m) return { kind: 'drive', thumb: '', embed: `https://drive.google.com/file/d/${m[1]}/preview` }
  if (/facebook\.com|fb\.watch/.test(url)) return { kind: 'facebook', thumb: '', embed: '' }
  if (/tiktok\.com/.test(url)) return { kind: 'tiktok', thumb: '', embed: '' }
  return { kind: 'link', thumb: '', embed: '' }
}

export const formatDate = (d) => {
  if (!d) return ''
  const dt = new Date(d)
  return Number.isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const money = (n) => (n ? `KES ${Number(n).toLocaleString('en-KE')}` : '')
