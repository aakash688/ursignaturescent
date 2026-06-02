import { Link } from 'react-router-dom'

type Props = { title: string; children?: React.ReactNode }

export default function AdminPlaceholder({ title, children }: Props) {
  return (
    <div>
      <Link to="/admin" className="text-sm text-gold mb-4 inline-block hover:underline">← Dashboard</Link>
      <h1 className="text-2xl font-display text-ivory mb-4">{title}</h1>
      {children ?? (
        <div className="border border-white/10 rounded-lg p-8 text-center text-smoke max-w-md">
          <p>This section is not fully wired yet. Connect to the Workers API when ready.</p>
        </div>
      )}
    </div>
  )
}
