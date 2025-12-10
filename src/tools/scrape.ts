import { CheerioAPI } from 'cheerio';
import {
    PlaywrightCrawler,
    RequestQueue,
    Dataset,
    log,
    DatasetContent,
} from 'crawlee';
import z from 'zod';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import * as cheerio from 'cheerio';
import { storeData } from './rag.js';

export const ScrapedData = z.object({
    url: z.string(),
    content: z.string(),
});

export type ScrapedData = z.infer<typeof ScrapedData>;

function cleanHtml($: CheerioAPI): void {
    const noiseSelectors = 'script, style, nav, footer, header, form, aside, iframe, noscript';
    $(noiseSelectors).remove();

    $('[class*="ad-"], [id*="ad-"], [class*="social"], .share-buttons').remove();
}

function extractMainContent(htmlString: string): { title: string; content: string } | null {
    if (!htmlString) return null;

    const dom = new JSDOM(htmlString);
    const document = dom.window.document;

    const reader = new Readability(document);
    const article = reader.parse();

    if (article) {
        return {
            title: article.title || '',
            content: article.textContent?.trim() || '',
        }
    }

    return null;
}

export async function scrape(urls: string[]) {
    log.setLevel(log.LEVELS.INFO);

    const requestQueue = await RequestQueue.open();
    for (const url of urls) {
        await requestQueue.addRequest({ url });
    }

    const crawler = new PlaywrightCrawler({
        requestQueue,
        maxRequestsPerCrawl: urls.length > 50 ? urls.length : 50,
        maxConcurrency: 3,

        async requestHandler({ page, request, log }) {
            log.info(`Processing URL (Using Browser): ${request.url}`);

            try {
                await page.waitForSelector('main, article, #content', { timeout: 10000 });
            } catch (error) {
                log.warning(`Main content selector not found in time for ${request.url}`);
            }

            const htmlContent = await page.content();
            const $ = cheerio.load(htmlContent);

            cleanHtml($);

            const cleanedHtml = $('body').html() || '';
            const articleData = extractMainContent(cleanedHtml);

            if (!articleData) {
                log.error(`Failed to extract main content from URL: ${request.url}`);
                return;
            }

            const validatedData = ScrapedData.parse({
                url: request.url,
                content: articleData.content,
            });

            await storeData(validatedData.url, validatedData.content);
        },

        async failedRequestHandler({ request, error, log }: any) {
            log.error(`Request failed for URL: ${request.url} with error: ${error.message}`);
        },
    });

    await crawler.run();
    log.info('Crawl finished. Data saved in the dataset.');
}