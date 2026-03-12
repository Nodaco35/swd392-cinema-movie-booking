import { Link } from 'react-router-dom'
import { PageShell } from '../components/PageShell'

export default function NotFoundPage() {
  return (
    <PageShell title="Page Not Found" hint="This route does not exist yet.">
      <Link className="btn" to="/">
        Go Home
      </Link>
    </PageShell>
  )
}

