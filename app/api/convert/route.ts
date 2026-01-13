import { NextResponse } from 'next/server';
import AdmZip from 'adm-zip';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase (Env vars from Vercel)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const { url } = await request.json();

        // 1. RECONNAISSANCE: Fetch Wordwall HTML
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (EduPort POC)' }
        });
        const html = await response.text();

        // 2. EXTRACTION: Regex Pattern Matching (Ported from TDD)
        // Looking for: window.activityModel = { ... };
        const regex = /window\.activityModel\s*=\s*(\{.*?\});/s;
        const match = html.match(regex);

        if (!match) {
            return NextResponse.json({
                error: "POC Limitation: This game format is not supported. The current version only supports older Wordwall templates that use the legacy 'activityModel' structure. Newer games use dynamic content loading which requires additional API integration.",
                details: "Try searching for 'Match up' or 'Quiz' templates from 2022 or earlier."
            }, { status: 400 });
        }

        const activityModel = JSON.parse(match[1]);
        console.log(`Extracted Activity: ${activityModel.title}`);

        // 3. TRANSFORMATION: Map to H5P (Match-Up Example)
        const h5pContent = {
            cards: activityModel.content.items.map((item: any, index: number) => ({
                image: null,
                match: {
                    library: "H5P.Text 1.1",
                    params: { content: item.question }
                },
                matchAlt: {
                    library: "H5P.Text 1.1",
                    params: { content: item.answers[0].text }
                }
            })),
            behaviour: { useGrid: true, allowRetry: true }
        };

        const h5pMetadata = {
            title: activityModel.title,
            language: "en",
            mainLibrary: "H5P.MemoryGame",
            preloadedDependencies: [
                { machineName: "H5P.MemoryGame", majorVersion: 1, minorVersion: 3 },
                { machineName: "H5P.Text", majorVersion: 1, minorVersion: 1 }
            ]
        };

        // 4. PACKAGING: Create the .h5p ZIP
        const zip = new AdmZip();
        zip.addFile("h5p.json", Buffer.from(JSON.stringify(h5pMetadata)));
        zip.addFile("content/content.json", Buffer.from(JSON.stringify(h5pContent)));

        const h5pBuffer = zip.toBuffer();

        // 5. DELIVERY: Upload to Supabase Storage
        const fileName = `conversion_${Date.now()}.h5p`;
        const { data, error } = await supabase
            .storage
            .from('h5p-files')
            .upload(fileName, h5pBuffer, {
                contentType: 'application/zip'
            });

        if (error) throw error;

        // Get Public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from('h5p-files')
            .getPublicUrl(fileName);

        // 6. AUDIT: Log to DB
        await supabase.from('conversions').insert({
            wordwall_url: url,
            download_url: publicUrl
        });

        return NextResponse.json({ success: true, downloadUrl: publicUrl });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
