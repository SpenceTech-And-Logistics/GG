import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { firebaseReady, getAuthKit, getDb } from '../../lib/firebase.js'
import CollectionEditor from './CollectionEditor.jsx'
import DocEditor from './DocEditor.jsx'
import Messages from './Messages.jsx'
import {
  contactDefaults, contactFields, galleryConfig, parliamentDefaults, parliamentFields,
  positionsConfig, pressConfig, profileDefaults, profileFields, projectsConfig,
} from './sections.js'
import '../../styles/admin.css'

const NAV = [
  ['profile', 'Profile and career'],
  ['parliament', 'Parliament record'],
  ['positions', 'Positions'],
  ['projects', 'Projects'],
  ['news', 'News and press'],
  ['gallery', 'Gallery'],
  ['messages', 'Messages'],
  ['contact', 'Contact and social links'],
]

function authMessage(code = '') {
  if (/invalid-credential|wrong-password|user-not-found|invalid-email/.test(code)) return 'The email or password is incorrect.'
  if (/too-many-requests/.test(code)) return 'Too many attempts. Wait a few minutes and try again.'
  if (/network/.test(code)) return 'No connection. Check the internet and try again.'
  return 'Sign-in failed. Please try again.'
}

function SignIn({ kit }) {
  const [err, setErr] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setBusy(true)
    setErr('')
    try {
      await kit.fa.signInWithEmailAndPassword(kit.auth, String(f.get('email')).trim(), String(f.get('password')))
    } catch (ex) {
      setErr(authMessage(ex.code))
    }
    setBusy(false)
  }
  async function reset(e) {
    const email = e.currentTarget.form.email.value.trim()
    if (!email) return setErr('Type your email above first.')
    try {
      await kit.fa.sendPasswordResetEmail(kit.auth, email)
      setErr('')
      setInfo('A reset link has been sent if that account exists.')
    } catch (ex) {
      setErr(authMessage(ex.code))
    }
  }

  return (
    <div className="adm-center">
      <form className="adm-signin" onSubmit={submit}>
        <div className="adm-brand"><span>GK</span><b>Site dashboard</b></div>
        <h1>Sign in</h1>
        <p>For Hon. Kagombe's office team. Visitors do not see this page.</p>
        <label>Email<input name="email" type="email" autoComplete="username" required placeholder="office@example.com" /></label>
        <label>Password<input name="password" type="password" autoComplete="current-password" required placeholder="Password" /></label>
        {err && <p className="adm-alert" role="alert">{err}</p>}
        {info && <p className="adm-ok" role="status">{info}</p>}
        <button className="adm-btn" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <button type="button" className="adm-link" onClick={reset}>Forgot password?</button>
        <small>Accounts are created by the site owner in Firebase. Signed-in users who are not administrators see a “no access” message.</small>
      </form>
    </div>
  )
}

export default function AdminApp() {
  const { pathname } = useLocation()
  const section = pathname.split('/')[2] || 'projects'
  const [kit, setKit] = useState(null)
  const [status, setStatus] = useState(firebaseReady ? 'loading' : 'off') // loading | out | noaccess | in | off
  const [user, setUser] = useState(null)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!firebaseReady) return
    document.title = 'Dashboard | Hon. Gabriel Gathuka Kagombe'
    let off = () => {}
    let alive = true
    ;(async () => {
      const k = await getAuthKit()
      if (!alive) return
      setKit(k)
      off = k.fa.onAuthStateChanged(k.auth, async (u) => {
        if (!u) {
          setUser(null)
          setStatus('out')
          return
        }
        setUser(u)
        try {
          const { fs, db } = await getDb()
          const snap = await fs.getDoc(fs.doc(db, 'admins', u.uid))
          setStatus(snap.exists() && snap.data().ok === true ? 'in' : 'noaccess')
        } catch {
          setStatus('noaccess')
        }
      })
    })()
    return () => {
      alive = false
      off()
    }
  }, [])

  useEffect(() => {
    if (status !== 'in') return
    let alive = true
    ;(async () => {
      const { fs, db } = await getDb()
      try {
        const snap = await fs.getDocs(fs.collection(db, 'messages'))
        if (alive) setUnread(snap.docs.filter((d) => !d.data().read).length)
      } catch {
        /* ignore */
      }
    })()
    return () => {
      alive = false
    }
  }, [status])

  if (status === 'off')
    return (
      <div className="adm-center">
        <div className="adm-signin">
          <h1>Dashboard not connected</h1>
          <p>Firebase is not set up yet. Open <code>site.config.js</code> in the project, paste the four values from the Firebase console, and redeploy. The README lists the steps.</p>
          <Link to="/" className="adm-link">← Back to the site</Link>
        </div>
      </div>
    )
  if (status === 'loading') return <div className="adm-center"><p>Loading…</p></div>
  if (status === 'out') return <SignIn kit={kit} />
  if (status === 'noaccess')
    return (
      <div className="adm-center">
        <div className="adm-signin">
          <h1>No access</h1>
          <p>You are signed in as {user?.email}, but this account is not an administrator of the site.</p>
          <p>To grant access, the site owner creates a document in <code>admins</code> with this ID and the field <code>ok = true</code>:</p>
          <code className="adm-uid">{user?.uid}</code>
          <button className="adm-btn" onClick={() => kit.fa.signOut(kit.auth)}>Sign out</button>
        </div>
      </div>
    )

  let body
  switch (section) {
    case 'profile':
      body = <DocEditor docId="profile" title="Profile and career" blurb="What visitors read on the home and About pages." fields={profileFields} defaults={profileDefaults} />
      break
    case 'parliament':
      body = <DocEditor docId="parliament" title="Parliament record" blurb="Figures, committees, Bills, votes and motions." fields={parliamentFields} defaults={parliamentDefaults} />
      break
    case 'positions':
      body = <CollectionEditor {...positionsConfig} />
      break
    case 'news':
      body = <CollectionEditor {...pressConfig} />
      break
    case 'gallery':
      body = <CollectionEditor {...galleryConfig} />
      break
    case 'messages':
      body = <Messages onCount={setUnread} />
      break
    case 'contact':
      body = <DocEditor docId="contact" title="Contact and social links" blurb="Office details and links shown on the Contact page and footer." fields={contactFields} defaults={contactDefaults} />
      break
    default:
      body = <CollectionEditor {...projectsConfig} />
  }

  return (
    <div className="adm">
      <aside className="adm-side">
        <div className="adm-brand"><span>GK</span><b>Site dashboard</b></div>
        <nav>
          {NAV.map(([key, label]) => (
            <NavLink key={key} to={`/admin/${key}`} className={section === key ? 'active' : ''}>
              {label}
              {key === 'messages' && unread > 0 && <em>{unread}</em>}
            </NavLink>
          ))}
        </nav>
        <div className="adm-side-foot">
          <Link to="/" target="_blank">View site ↗</Link>
          <button type="button" onClick={() => kit.fa.signOut(kit.auth)}>Sign out</button>
        </div>
      </aside>
      <main className="adm-main" key={section}>
        {body}
        <p className="adm-credit">Built by SpenceTec and Logistics Limited</p>
      </main>
    </div>
  )
}
