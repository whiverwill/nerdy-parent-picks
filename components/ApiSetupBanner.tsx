export default function ApiSetupBanner() {
  return (
    <div className="mx-auto max-w-lg mt-12 text-center px-4">
      <div className="bg-tnp-purple/5 border-2 border-tnp-purple/20 rounded-2xl p-8">
        <div className="text-5xl mb-4">🔑</div>
        <h2 className="font-extrabold text-xl text-gray-900 mb-2">Almost ready!</h2>
        <p className="text-gray-600 text-sm mb-4">
          Add your YouTube Data API key to <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">.env.local</code> to start loading videos.
        </p>
        <div className="text-left bg-gray-900 rounded-xl p-4 text-xs font-mono text-green-400">
          <span className="text-gray-500"># .env.local</span>
          <br />
          YOUTUBE_API_KEY=<span className="text-yellow-400">your_key_here</span>
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Get a free key at{' '}
          <a
            href="https://console.cloud.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-tnp-purple underline"
          >
            console.cloud.google.com
          </a>
        </p>
      </div>
    </div>
  )
}
