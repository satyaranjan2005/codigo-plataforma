// Reusable loading components for consistent UI across the app

/**
 * Simple spinner component
 */
export function Spinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  return (
    <div
      className={`${sizeClasses[size]} border-gray-200 border-t-blue-600 rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Full page loading with message
 */
export function PageLoader({ message = 'Loading...', description }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Spinner size="xl" className="mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">{message}</h2>
        {description && (
          <p className="text-gray-500 mt-2">{description}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Card skeleton loader
 */
export function CardSkeleton({ count = 1, className = '' }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}
        >
          <div className="h-40 bg-gray-200 rounded mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * Table skeleton loader
 */
export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
        <div className={`grid grid-cols-${columns} gap-4`}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-gray-200 px-6 py-4">
          <div className={`grid grid-cols-${columns} gap-4`}>
            {Array.from({ length: columns }).map((_, j) => (
              <div key={j} className="h-4 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Text skeleton loader
 */
export function TextSkeleton({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-200 rounded animate-pulse ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        ></div>
      ))}
    </div>
  );
}

/**
 * Avatar skeleton loader
 */
export function AvatarSkeleton({ size = 'md', withText = false }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`${sizeClasses[size]} bg-gray-200 rounded-full animate-pulse`}></div>
      {withText && (
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
      )}
    </div>
  );
}

/**
 * Grid skeleton loader
 */
export function GridSkeleton({ cols = 3, rows = 2, gap = 4 }) {
  const colsClass = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${colsClass[cols]} gap-${gap}`}>
      {Array.from({ length: cols * rows }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="h-40 bg-gray-200 rounded mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </div>
      ))}
    </div>
  );
}

/**
 * Button skeleton loader
 */
export function ButtonSkeleton({ count = 1, className = '' }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`h-10 w-32 bg-gray-200 rounded animate-pulse ${className}`}
        ></div>
      ))}
    </>
  );
}

/**
 * Content loader with header and body
 */
export function ContentLoader({ withHeader = true, withBody = true }) {
  return (
    <div className="space-y-6">
      {withHeader && (
        <div>
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
      )}
      
      {withBody && (
        <div className="space-y-4">
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <TextSkeleton lines={4} />
        </div>
      )}
    </div>
  );
}

const LoadingSkeletons = {
  Spinner,
  PageLoader,
  CardSkeleton,
  TableSkeleton,
  TextSkeleton,
  AvatarSkeleton,
  GridSkeleton,
  ButtonSkeleton,
  ContentLoader,
};

export default LoadingSkeletons;
