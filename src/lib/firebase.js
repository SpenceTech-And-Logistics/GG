import { siteConfig } from '../../site.config.js'

export const firebaseReady = Boolean(siteConfig.firebase.apiKey && siteConfig.firebase.projectId)

let appPromise
function getApp() {
  if (!appPromise) {
    appPromise = import('firebase/app').then((m) => m.initializeApp(siteConfig.firebase))
  }
  return appPromise
}

/** Firestore, loaded on demand. Returns null when Firebase is not configured. */
export async function getDb() {
  if (!firebaseReady) return null
  const fs = await import('firebase/firestore')
  const db = fs.getFirestore(await getApp())
  return { fs, db }
}

/** Firebase Auth, loaded only by the admin. */
export async function getAuthKit() {
  if (!firebaseReady) return null
  const fa = await import('firebase/auth')
  const auth = fa.getAuth(await getApp())
  return { fa, auth }
}
