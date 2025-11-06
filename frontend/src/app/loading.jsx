export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 dark:border-white mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading...</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Please wait while we load the page</p>
      </div>
    </div>
  );
}
