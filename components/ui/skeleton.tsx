"use client";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] rounded ${className || ""}`}
      style={{
        animation: "shimmer 1.5s ease-in-out infinite",
      }}
    />
  );
}

// Message skeleton for loading states
export function MessageSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Content skeleton - mimics analysis report structure */}
      <div className="space-y-3">
        {/* Title line */}
        <Skeleton className="h-6 w-3/4" />

        {/* Paragraph lines */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-700/50 rounded-lg p-3 space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-12" />
            </div>
          ))}
        </div>

        {/* More content lines */}
        <div className="space-y-2 mt-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}

// Video analysis table skeleton
export function VideoTableSkeleton() {
  return (
    <div className="space-y-3 animate-fade-in">
      {/* Table header */}
      <div className="flex gap-4 py-2 border-b border-gray-700">
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-12" />
      </div>

      {/* Table rows */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 py-3 border-b border-gray-700/50"
        >
          <Skeleton className="w-4 h-4" />
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="w-12 h-16 rounded" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-6 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// Add shimmer animation to globals.css if not present
// @keyframes shimmer {
//   0% { background-position: 200% 0; }
//   100% { background-position: -200% 0; }
// }
