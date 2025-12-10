import z from "zod";
import { State } from "../Schemas/State.js";
import { scrapeAndStore } from "../tools/scrape.js";

export const scrapeAndStoreNode = async (state: z.infer<typeof State>): Promise<Partial<z.infer<typeof State>>> => {
    const urls = state.relevantUrls;
    await scrapeAndStore(urls);

    return {};
}