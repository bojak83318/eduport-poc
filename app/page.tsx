'use client';

import { useState } from 'react';

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attested, setAttested] = useState(false);

  const handleConvert = async () => {
    if (!attested) {
      setError('Please attest that you own the rights to this content');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wordwallUrl: url, attestOwnership: true }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error);
      }

      // Download .h5p file
      const blob = await res.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'activity.h5p';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-indigo-600 mb-3">EduPort</h1>
          <p className="text-xl text-gray-600">
            Convert Wordwall to H5P in seconds
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              Wordwall Activity URL
            </label>
            <input
              id="url"
              type="url"
              placeholder="https://wordwall.net/resource/12345678"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />
          </div>

          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={attested}
              onChange={(e) => setAttested(e.target.checked)}
              className="mt-1 h-5 w-5"
              disabled={loading}
            />
            <span className="text-sm text-gray-700">
              I attest that I own the rights to this content
            </span>
          </label>

          <button
            onClick={handleConvert}
            disabled={loading || !url || !attested}
            className="w-full bg-indigo-600 text-white font-semibold py-4 rounded-lg disabled:bg-gray-300"
          >
            {loading ? 'Converting...' : 'Convert to H5P'}
          </button>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
