import { Link } from 'react-router-dom'

type Props = { title: string; children?: React.ReactNode }

export default function Placeholder({ title, children }: Props) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link to="/" className="text-sm text-gold mb-6 inline-block hover:underline">← Home</Link>
      <h1 className="text-3xl font-display text-ivory mb-4">{title}</h1>
      {children ?? (
        <p className="text-smoke">
          This page is not fully built yet. Content will be added here.
        </p>
      )}
    </div>
  )
}
