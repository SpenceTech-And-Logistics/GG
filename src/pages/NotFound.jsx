import Empty from '../components/Empty.jsx'

export default function NotFound() {
  return (
    <section className="wrap section">
      <Empty title="This page could not be found" text="The address may be wrong or the page may have moved." cta={{ to: '/', label: 'Back to the home page' }} />
    </section>
  )
}
