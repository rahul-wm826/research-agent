import z from "zod";
import { State } from "../Schemas/State.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { llm } from "../llm.js";

export const siteRelevanceNode = async (state: z.infer<typeof State>): Promise<Partial<z.infer<typeof State>>> => {
    const searchResult = state.searchResult;

    const messages = [
        new SystemMessage(`
            You are a Website relevance evaluator.
            **Task:** Evaluate the relevance of the Website in the search result to the user's query. Select only 3 relevant ones.
            **Constraint:** Websites MUST be relevant to the user's query.

            **Output MUST be a JSON array of urls strings of length 10 ONLY.**

            Example Output:
            ["first url", "second url", "third url"]
        `),
        new HumanMessage(`
            User Query: ${state.userInput}
            Below is the search result:
            ${JSON.stringify(searchResult)}
        `),
    ];

    const llmWithStructureOutput = llm.withStructuredOutput(z.object({
        urls: z.array(z.string()),
    }));

    const response = await llmWithStructureOutput.invoke(messages);
    const urls = response.urls;

    return {
        relevantUrls: urls
    };
}