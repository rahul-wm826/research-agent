import z from "zod";
import { State } from "../Schemas/State.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { llm } from "../llm.js";

export const urlRelevanceNode = async (state: z.infer<typeof State>): Promise<Partial<z.infer<typeof State>>> => {
    const searchResult = state.searchResult;

    const messages = [
        new SystemMessage(`
            You are a URL relevance evaluator.
            **Task:** Evaluate the relevance of the URLs in the search result to the user's query. Select only 3 relevant ones.
            **Constraint:** URLs MUST be relevant to the user's query.

            **Output MUST be a JSON array of strings of length 10 ONLY.**

            Example Output:
            ["first URL", "second URL", "third URL"]
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