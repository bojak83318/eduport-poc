"use client";
import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('idle');
  const [download, setDownload] = useState('');

  const handleConvert = async () => {
    setStatus('processing');
    const res = await fetch('/api/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const data = await res.json();

    if (data.success) {
      setDownload(data.downloadUrl);
      setStatus('complete');
    } else {
      alert('Error: ' + data.error);
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8 text-blue-400">EduPort POC</h1>
      <p className="text-gray-400 mb-4 text-center max-w-md">
        Tracer Bullet: Single Wordwall → H5P Conversion
      </p>
      <div className="w-full max-w-md space-y-4">
        <input
          className="w-full p-4 rounded bg-gray-800 border border-gray-700 text-white"
          placeholder="Paste Wordwall URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          onClick={handleConvert}
          disabled={status === 'processing'}
          className="w-full p-4 bg-blue-600 rounded hover:bg-blue-500 disabled:opacity-50 transition-all"
        >
          {status === 'processing' ? 'Transpiling...' : 'Convert to H5P'}
        </button>

        {status === 'complete' && (
          <a
            href={download}
            download
            className="block w-full text-center p-4 bg-green-600 rounded mt-4 hover:bg-green-500 transition-all"
          >
            ⬇️ Download .h5p File
          </a>
        )}
      </div>
      <div className="mt-12 text-xs text-gray-600 max-w-md text-center">
        <p>Tech Stack: Next.js + Vercel + Supabase</p>
        <p>Status: Proof of Concept (Single Template)</p>
      </div>
    </div>
  );
}
