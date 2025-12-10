import z from "zod";
import { llm } from "../llm.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { State } from "../Schemas/State.js";
import { googleSearch } from "../tools/googleSearch.js";
import { SearchSchema } from "../Schemas/Search.js";

export const searchNode = async (state: z.infer<typeof State>): Promise<Partial<z.infer<typeof State>>> => {
    const messages = [
        new SystemMessage(`
            You are an expert **Web Search Query Optimizer and Simplification Engine**. Your task is to analyze a list of detailed, complex research queries and extract the most essential, high-value keywords and key phrases from each one.

            These extracted phrases will be used as queries for a **traditional, lexical web search engine (like Google)**. Therefore, the output for each query must be:

            1.  **Concise:** Use only the most critical keywords, typically 3 to 7 words per query.
            2.  **Targeted:** Focus on factual names, technical terms, specific concepts, and key comparisons.
            3.  **Lexical:** Eliminate filler words, articles (a, an, the), prepositions, and verbs unless they are critical to the meaning (e.g., "compare," "review").

            ### Input Content (JSON Array of Expanded Sub-Queries)

            Review the following array of detailed research queries:
            [Insert the JSON array of sub-queries generated in the previous step here]

            ### Output Format

            You must only output a **single JSON array of strings**. Each string in the array must be the optimized, concise web search query corresponding to the input research query at that index. Do not include any introductory text, explanation, or markdown formatting outside of the JSON structure.
            Give only 3 phrases.

            json
            [
                "Optimized keyword phrase 1 for web search",
                "Optimized keyword phrase 2 for web search",
                "Optimized keyword phrase 3 for web search"
            ]
        `),
        new HumanMessage(JSON.stringify(state.queries)),
    ];

    const llmWithStructureOutput = llm.withStructuredOutput(z.object({
        queries: z.array(z.string()),
    }));

    const response = await llmWithStructureOutput.invoke(messages);
    const queries = response.queries;

    const searchData: z.infer<typeof SearchSchema>[] = await Promise.all(queries.map((query: string) => googleSearch(query)));

    // Extract and flatten organic results from all search queries
    const organicResults = searchData.flatMap(result => result.organic || []);

    return {
        searchResult: organicResults
    };
};
