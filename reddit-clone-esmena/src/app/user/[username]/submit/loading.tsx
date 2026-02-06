export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="flex">
        <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-64 bg-gray-200 dark:bg-slate-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
