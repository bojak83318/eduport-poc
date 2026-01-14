
import { WordwallScraper } from '../lib/scraping/wordwall-scraper';

async function main() {
    const url = 'https://wordwall.net/resource/101727466/esa/have-got-has-got-affirmative-negative';
    const scraper = new WordwallScraper();

    try {
        console.log(`Scraping ${url}...`);
        const result = await scraper.scrape(url);
        console.log('✅ Scrape successful!');
        console.log('Title:', result.title);
        console.log('Template:', result.template);
        console.log('Item count:', result.content.items?.length);
        console.log('First Item:', JSON.stringify(result.content.items?.[0], null, 2));
    } catch (error) {
        console.error('❌ Scrape failed:', error);
    }
}

main();
