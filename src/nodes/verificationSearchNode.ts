import z from "zod";
import { State } from "../Schemas/State.js";
import { SearchSchema } from "../Schemas/Search.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { llm } from "../llm.js";
import { googleSearch } from "../tools/googleSearch.js";

export const FactCheckSearchSchema = z.object({
    claim: z.string(),
    organicResults: z.array(z.string().or(z.undefined())),
    knowledgeGraph: z.string().optional(),
});

export type FactCheckSearch = z.infer<typeof FactCheckSearchSchema>;

async function search(claim: string): Promise<FactCheckSearch> {
    const messages = [
        new SystemMessage(`
                You are a **Precise Search Query Formulator**. Your task is to analyze a single factual claim extracted from a research report and convert it into a **single, highly optimized search query** for an external search engine.

                **Constraints:**
                1.  **Direct and Specific:** The query must be an exact phrase designed to retrieve the factual basis (dates, statistics, official names) of the claim.
                2.  **Minimize Keywords:** Use only the essential terms (3-7 words) that maximize the probability of retrieving a direct answer or the original source document.
                3.  **Output Format (STRICT JSON):** Output ONLY a JSON object containing the optimized query. Do not include any introductory text, explanation, or markdown formatting outside of the JSON structure.

                json
                {
                    "optimizedQuery": "The single, best search query for verification."
                }
            `),
        new HumanMessage(`
                Claim: ${claim}
            `)
    ];

    const llmWithStructureOutput = llm.withStructuredOutput(z.object({
        optimizedQuery: z.string(),
    }));

    const response = await llmWithStructureOutput.invoke(messages);
    const optimizedQuery = response.optimizedQuery;

    const searchData: z.infer<typeof SearchSchema> = await googleSearch(optimizedQuery);

    return {
        claim,
        organicResults: searchData.organic.map(data => data.snippet),
        knowledgeGraph: searchData.knowledgeGraph?.description,
    };
}

export const verificationSearchNode = async (state: z.infer<typeof State>): Promise<Partial<z.infer<typeof State>>> => {
    const claims = state.claims;

    const results = [];
    for (const claim of claims) {
        const result = await search(claim);
        results.push(result);
    }

    return {
        factCheckSearch: results
    };
}