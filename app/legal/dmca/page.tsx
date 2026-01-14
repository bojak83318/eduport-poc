'use client'

import { useState } from 'react'

export default function DmcaPage() {
    const [submitted, setSubmitted] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        await fetch('/api/dmca', {
            method: 'POST',
            body: JSON.stringify(Object.fromEntries(formData)),
            headers: { 'Content-Type': 'application/json' },
        })

        setSubmitted(true)
    }

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-4">DMCA Takedown Request</h1>

            <div className="prose mb-8">
                <p>
                    EduPort respects intellectual property rights. If you believe content
                    converted through our service infringes your copyright, please submit
                    a DMCA takedown notice below.
                </p>

                <h2>Required Information</h2>
                <ol>
                    <li>Identification of the copyrighted work</li>
                    <li>The Wordwall URL that was converted</li>
                    <li>Your contact information</li>
                    <li>A statement of good faith belief</li>
                    <li>A statement of accuracy under penalty of perjury</li>
                </ol>
            </div>

            {submitted ? (
                <div className="bg-green-50 border border-green-300 p-4 rounded">
                    <p className="text-green-800 font-semibold">
                        ✅ Your DMCA notice has been submitted. We will respond within 48 hours.
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block font-medium mb-1">Your Email *</label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <div>
                        <label className="block font-medium mb-1">Wordwall URL *</label>
                        <input
                            type="url"
                            name="wordwallUrl"
                            required
                            placeholder="https://wordwall.net/resource/..."
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <div>
                        <label className="block font-medium mb-1">Description of Copyrighted Work *</label>
                        <textarea
                            name="description"
                            required
                            rows={4}
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <div>
                        <label className="flex items-start gap-2">
                            <input type="checkbox" name="goodFaith" required className="mt-1" />
                            <span>
                                I have a good faith belief that the use of the material is not
                                authorized by the copyright owner, its agent, or the law.
                            </span>
                        </label>
                    </div>

                    <div>
                        <label className="flex items-start gap-2">
                            <input type="checkbox" name="perjury" required className="mt-1" />
                            <span>
                                I swear, under penalty of perjury, that the information in this
                                notification is accurate and that I am the copyright owner or
                                authorized to act on behalf of the owner.
                            </span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Submit DMCA Notice
                    </button>
                </form>
            )}
        </div>
    )
}
