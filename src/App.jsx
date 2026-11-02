import { lazy, Suspense, useEffect, useRef } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import Footer from './components/Footer.jsx'
import Navbar from './components/Navbar.jsx'
import { useScroll } from './lib/hooks.js'
import { useSeo } from './lib/useSeo.js'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import EventDetail from './pages/EventDetail.jsx'
import Events from './pages/Events.jsx'
import Gallery from './pages/Gallery.jsx'
import Home from './pages/Home.jsx'
import News from './pages/News.jsx'
import NotFound from './pages/NotFound.jsx'
import Parliament from './pages/Parliament.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'
import Projects from './pages/Projects.jsx'

// The dashboard (and Firebase Auth) is only downloaded when someone opens /admin.
const AdminApp = lazy(() => import('./pages/admin/AdminApp.jsx'))

function Layout() {
  const { pathname, hash } = useLocation()
  const bar = useRef(null)

  useSeo()
  useEffect(() => {
    // Open at the top, or at a section when the address has one (e.g. /about#positions).
    if (!hash) {
      window.scrollTo(0, 0)
      return undefined
    }
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120)
    return () => clearTimeout(t)
  }, [pathname, hash])

  useScroll((y) => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    bar.current?.style.setProperty('--p', max > 0 ? Math.min(1, y / max) : 0)
  })

  return (
    <>
      <a href="#content" className="skip">Skip to content</a>
      <div className="scroll-progress" ref={bar} aria-hidden="true" />
      <Navbar />
      <main id="content" key={pathname} className="page">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="parliament" element={<Parliament />} />
        {/* Positions now live on the About page; old links still work. */}
        <Route path="positions" element={<Navigate to="/about#positions" replace />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="events" element={<Events />} />
        <Route path="events/:id" element={<EventDetail />} />
        <Route path="news" element={<News />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route
        path="admin/*"
        element={
          <Suspense fallback={<p style={{ padding: 40 }}>Loading the dashboard…</p>}>
            <AdminApp />
          </Suspense>
        }
      />
    </Routes>
  )
}
