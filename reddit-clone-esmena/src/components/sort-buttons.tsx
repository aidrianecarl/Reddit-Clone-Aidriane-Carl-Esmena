"use client"

interface SortButtonsProps {
  sortBy: string
  onSortChange: (sort: string) => void
}

export function SortButtons({ sortBy, onSortChange }: SortButtonsProps) {
  const sortOptions = [
    { value: "newest", label: "New", icon: "🔥" },
    { value: "top", label: "Top", icon: "📈" },
    { value: "hot", label: "Hot", icon: "⚡" },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {sortOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onSortChange(option.value)}
          className={`px-4 py-2 rounded-full font-semibold text-sm transition-all flex items-center gap-2 ${
            sortBy === option.value ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-900 hover:bg-gray-200"
          }`}
        >
          <span>{option.icon}</span>
          {option.label}
        </button>
      ))}
    </div>
  )
}
