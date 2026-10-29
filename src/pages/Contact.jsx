import { useState } from 'react'
import PageHead from '../components/PageHead.jsx'
import { Reveal } from '../components/Reveal.jsx'
import { firebaseReady, getDb } from '../lib/firebase.js'
import { useContent } from '../lib/useContent.js'

const TOPICS = ['Constituency issue', 'Bursaries and education', 'Tea and farming', 'Invitation or event', 'Media request', 'Other']

export default function Contact() {
  const { contact } = useContent()
  const [state, setState] = useState('idle')
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    if (f.get('website')) return // honeypot
    setState('sending')
    setError('')
    try {
      const kit = await getDb()
      if (!kit) throw new Error('The form is not connected yet.')
      const { fs, db } = kit
      await fs.addDoc(fs.collection(db, 'messages'), {
        name: String(f.get('name')).trim(),
        email: String(f.get('email')).trim(),
        phone: String(f.get('phone')).trim(),
        topic: String(f.get('topic')),
        message: String(f.get('message')).trim(),
        createdAt: fs.serverTimestamp(),
        read: false,
      })
      setState('sent')
    } catch (err) {
      console.warn(err)
      setError('Your message could not be sent. Please try again in a moment.')
      setState('idle')
    }
  }

  const rows = [
    ['Constituency office', contact.office],
    ['Parliament', contact.parliament],
    ['Email', contact.email],
    ['Phone', contact.phone],
  ]
  const links = [...(contact.social || []), ...(contact.links || [])].filter((l) => l.url)

  return (
    <>
      <PageHead
        eyebrow="Contact"
        title="Write to the office of the Member for Gatundu South"
        lead="Tell the office what you need, whether an issue in the constituency, an invitation or a question about a Bill. A member of his team will respond."
      />
      <section className="wrap section-tight">
        <div className="contact-grid">
          <Reveal className="panel">
            {state === 'sent' ? (
              <div role="status" style={{ padding: '24px 0' }}>
                <h2 style={{ fontSize: 32, marginBottom: 12 }}>Thank you. Your message has been received.</h2>
                <p className="muted">The office will reply by email or phone.</p>
              </div>
            ) : !firebaseReady ? (
              <div role="status">
                <h2 style={{ fontSize: 28, marginBottom: 12 }}>The online form is being set up</h2>
                <p className="muted">Please use the office details beside this panel in the meantime.</p>
              </div>
            ) : (
              <form className="form" onSubmit={submit}>
                <div className="form-row">
                  <label>Your name<input name="name" required maxLength={120} autoComplete="name" placeholder="Full name" /></label>
                  <label>Email<input name="email" type="email" required maxLength={160} autoComplete="email" placeholder="you@example.com" /></label>
                </div>
                <div className="form-row">
                  <label>Phone (optional)<input name="phone" type="tel" maxLength={40} autoComplete="tel" placeholder="07.." /></label>
                  <label>Topic<select name="topic">{TOPICS.map((t) => <option key={t}>{t}</option>)}</select></label>
                </div>
                <label>Message<textarea name="message" rows={6} required maxLength={4000} placeholder="How can the office help?" /></label>
                <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                {error && <p className="alert" role="alert">{error}</p>}
                <button type="submit" className="btn btn-solid" style={{ alignSelf: 'flex-start' }} disabled={state === 'sending'}>
                  {state === 'sending' ? 'Sending…' : 'Send message'}
                </button>
              </form>
            )}
          </Reveal>

          <Reveal variant="right" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="office">
              <h2>Office details</h2>
              <dl style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
                {rows.map(([k, v]) => (
                  <div key={k}><dt>{k}</dt><dd className={v ? '' : 'pending'}>{v || 'To be announced'}</dd></div>
                ))}
              </dl>
            </div>
            {links.length > 0 && (
              <div className="panel">
                <h3 style={{ fontSize: 22, marginBottom: 14 }}>Follow</h3>
                <div className="chips">
                  {links.map((l) => <a key={l.url} className="chip" href={l.url} target="_blank" rel="noreferrer">{l.label || l.url}</a>)}
                </div>
              </div>
            )}
          </Reveal>
        </div>
      </section>
    </>
  )
}
