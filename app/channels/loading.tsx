export default function Loading() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="space-y-1">
        <div className="h-6 w-40 bg-gray-200 rounded" />
        <div className="h-3 w-28 bg-gray-100 rounded" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, j) => (
              <div key={j} className="flex flex-col items-center gap-2 p-4">
                <div className="w-16 h-16 rounded-full bg-gray-200" />
                <div className="h-3 w-20 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
