import z from "zod";
import { State } from "../Schemas/State.js";
import { scrape } from "../tools/scrape.js";

export const scrapeNode = async (state: z.infer<typeof State>): Promise<Partial<z.infer<typeof State>>> => {
    const urls = state.relevantUrls;
    await scrape(urls);

    return {};
}