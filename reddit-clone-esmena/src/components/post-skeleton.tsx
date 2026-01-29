export function PostSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-slate-800">
        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-slate-700" />
        <div className="flex-1">
          <div className="h-3 bg-gray-300 dark:bg-slate-700 rounded w-32 mb-2" />
          <div className="h-2 bg-gray-200 dark:bg-slate-800 rounded w-24" />
        </div>
      </div>

      {/* Title */}
      <div className="px-4 pt-4">
        <div className="h-5 bg-gray-300 dark:bg-slate-700 rounded w-3/4 mb-3" />
      </div>

      {/* Image or Content */}
      <div className="w-full h-64 bg-gray-300 dark:bg-slate-700 mx-auto" />

      {/* Footer Actions */}
      <div className="px-4 py-3 flex gap-4 border-t border-gray-200 dark:border-slate-800">
        <div className="h-4 bg-gray-300 dark:bg-slate-700 rounded w-16" />
        <div className="h-4 bg-gray-300 dark:bg-slate-700 rounded w-16" />
        <div className="h-4 bg-gray-300 dark:bg-slate-700 rounded w-16" />
      </div>
    </div>
  )
}
