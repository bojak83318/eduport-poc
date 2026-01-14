export function CodeExamples() {
    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Code Examples</h2>

            <h3 className="text-xl font-semibold mt-6">cURL</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                {`curl -X POST https://eduport.app/api/convert \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://wordwall.net/resource/12345678"}'`}
            </pre>

            <h3 className="text-xl font-semibold mt-6">Python</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                {`import requests

response = requests.post(
    "https://eduport.app/api/convert",
    json={"url": "https://wordwall.net/resource/12345678"}
)
data = response.json()
print(f"Download: {data['downloadUrl']}")`}
            </pre>

            <h3 className="text-xl font-semibold mt-6">Node.js</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                {`const response = await fetch("https://eduport.app/api/convert", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ url: "https://wordwall.net/resource/12345678" })
});
const data = await response.json();
console.log(\`Download: \${data.downloadUrl}\`);`}
            </pre>
        </div>
    )
}
