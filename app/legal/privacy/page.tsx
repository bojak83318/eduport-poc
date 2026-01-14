export default function PrivacyPage() {
    return (
        <div className="max-w-4xl mx-auto p-8 prose">
            <h1>Privacy Policy</h1>
            <p className="text-gray-500">Last updated: January 14, 2026</p>

            <h2>1. Information We Collect</h2>
            <h3>Account Information</h3>
            <ul>
                <li>Email address (from OAuth provider)</li>
                <li>Name (optional, from OAuth provider)</li>
                <li>OAuth provider (Google or GitHub)</li>
            </ul>

            <h3>Usage Data</h3>
            <ul>
                <li>Wordwall URLs you convert</li>
                <li>Conversion timestamps and status</li>
                <li>IP address for rate limiting</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <ul>
                <li>Provide the conversion service</li>
                <li>Enforce rate limits and quotas</li>
                <li>Send service-related communications</li>
                <li>Improve our service through analytics</li>
            </ul>

            <h2>3. Data Retention</h2>
            <p>
                We retain conversion records for 90 days. You may request deletion
                of your data at any time by contacting privacy@eduport.app.
            </p>

            <h2>4. Data Sharing</h2>
            <p>
                We do not sell your personal information. We may share data with:
            </p>
            <ul>
                <li>Service providers (hosting, analytics)</li>
                <li>Law enforcement when legally required</li>
            </ul>

            <h2>5. Your Rights (GDPR/CCPA)</h2>
            <ul>
                <li>Access your personal data</li>
                <li>Request data deletion</li>
                <li>Export your data</li>
                <li>Opt out of analytics</li>
            </ul>

            <h2>6. Cookies</h2>
            <p>
                We use essential cookies for authentication. We use Vercel Analytics
                which collects anonymized usage data.
            </p>

            <h2>7. Contact</h2>
            <p>
                Data Protection Officer: privacy@eduport.app
            </p>
        </div>
    )
}
