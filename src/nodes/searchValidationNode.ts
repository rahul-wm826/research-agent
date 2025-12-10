import z from "zod";
import { State } from "../Schemas/State.js";
import { OrganicResultSchema } from "../Schemas/Search.js";

const FORBIDDEN_HOSTS = new Set([
    'tw'
])

export function validateUrls(searchResult: z.infer<typeof OrganicResultSchema>[]) {
    const validatedSites: z.infer<typeof OrganicResultSchema>[] = [];

    for (const site of searchResult) {
        try {
            if (!site.link) {
                console.warn(`URL not found: ${site.link}`);
                continue;
            }

            const url = new URL(site.link);
            const hostname = url.hostname.toLowerCase();

            if (FORBIDDEN_HOSTS.has(hostname)) {
                console.warn(`Blocked URL (Blacklist): ${site.link}`);
                continue;
            }

            if (url.pathname.endsWith('.pdf') || url.pathname.endsWith('.zip')) {
                console.warn(`Blocked URL (Unsupported File Type): ${site.link}`);
                continue;
            }

            if (site.link.length > 500) {
                console.warn(`Blocked URL (Excessive Length): ${site.link}`);
                continue;
            }

            validatedSites.push(site);
        } catch (error) {
            console.error(`Invalid URL structure: ${site.link}`);
        }
    }

    return validatedSites;
}

export const searchValidationNode = async (state: z.infer<typeof State>): Promise<Partial<z.infer<typeof State>>> => {
    const searchResult = state.searchResult;
    const validatedSites = validateUrls(searchResult);

    return {
        searchResult: validatedSites
    };
}