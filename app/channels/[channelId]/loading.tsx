export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Back link placeholder */}
      <div className="h-4 w-28 bg-gray-100 rounded" />

      {/* Channel header skeleton */}
      <div className="flex items-center gap-5 p-5 rounded-2xl bg-gray-50 border border-gray-100">
        <div className="w-20 h-20 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-48 bg-gray-200 rounded" />
          <div className="h-3 w-64 bg-gray-100 rounded" />
          <div className="h-3 w-32 bg-gray-100 rounded" />
        </div>
      </div>

      {/* Video grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="w-full aspect-video rounded-xl bg-gray-200" />
            <div className="h-3 w-full bg-gray-100 rounded" />
            <div className="h-3 w-2/3 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
