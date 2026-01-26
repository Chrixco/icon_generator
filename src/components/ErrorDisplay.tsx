'use client'

interface ErrorDisplayProps {
  error: string | null
  onDismiss: () => void
}

export default function ErrorDisplay({ error, onDismiss }: ErrorDisplayProps) {
  if (!error) return null

  return (
    <div className="bg-gradient-to-r from-sunset-100 to-sunset-200 border-2 border-sunset-300 rounded-xl p-6 shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className="flex items-center justify-center w-10 h-10 bg-sunset-400 rounded-lg mr-4 flex-shrink-0">
            <span className="text-xl">⚠️</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-sunset-800 mb-2">
              Oops! Something went wrong
            </h3>
            <p className="text-sunset-700 leading-relaxed">{error}</p>

            <div className="mt-4 bg-sunset-50 rounded-lg p-3 border border-sunset-200">
              <h4 className="font-medium text-sunset-800 mb-2 flex items-center">
                <span className="mr-2">💡</span>
                Quick Fixes
              </h4>
              <ul className="text-sm text-sunset-700 space-y-1">
                <li>• Check your API keys in the .env.local file</li>
                <li>• Make sure you have billing enabled for your AI provider</li>
                <li>• Try a different provider or model</li>
                <li>• Refresh the page and try again</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="p-2 text-sunset-600 hover:text-sunset-800 hover:bg-sunset-200 rounded-lg transition-all ml-4 flex-shrink-0"
          title="Dismiss error"
        >
          <span className="text-lg">✕</span>
        </button>
      </div>
    </div>
  )
}