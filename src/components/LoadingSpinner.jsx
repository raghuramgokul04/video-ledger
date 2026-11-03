export default function LoadingSpinner({ text = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 rounded-full border-2 border-vl-border" />
        <div className="absolute inset-0 rounded-full border-2 border-t-vl-green border-l-transparent border-r-transparent border-b-transparent animate-spin" />
      </div>
      <p className="text-xs font-mono text-vl-muted tracking-widest">{text}</p>
    </div>
  )
}
