import z from "zod";
import { State } from "../Schemas/State.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { llm } from "../llm.js";

export const queryNode = async (state: z.infer<typeof State>): Promise<Partial<z.infer<typeof State>>> => {
    state.messages.push(new HumanMessage(state.userInput));

    const messages = [
        new SystemMessage(`
            You are an expert **Query Deconstruction and Expansion Engine**. Your task is to analyze a single, complex user query and decompose it into **three (3) to five (5) distinct, independent, and highly detailed research sub-queries**.

            These sub-queries will be used for **semantic search** in a vector database. Therefore, each generated query must be:

            1.  **High-Context:** Each query must be a full, descriptive natural language sentence or complex phrase. Do not use simple keywords.
            2.  **Independent:** Each query must target a unique aspect or dimension of the original user's request, ensuring comprehensive coverage of the topic.
            3.  **Optimized for Meaning:** Phrase the queries to encode the maximum semantic intent, making them ideal for vector embedding and retrieval.
            4.  **Actionable:** Frame the queries as specific research questions that, when answered together, synthesize the final response to the user.

            ### Output Format

            You must only output a JSON array of strings. Do not include any introductory text, explanation, or markdown formatting outside of the JSON structure.

            json
            [
                "Detailed research query 1 targeting aspect A of the user request.",
                "Detailed research query 2 targeting aspect B of the user request.",
                "Detailed research query 3 targeting aspect C of the user request."
            ]
        `),
        new HumanMessage(`
            User Query: ${state.userInput}
        `),
    ];

    const llmWithStructureOutput = llm.withStructuredOutput(z.object({
        queries: z.array(z.string()),
    }));

    let queriesToReturn: string[] = [];

    try {
        const response = await llmWithStructureOutput.invoke(messages);
        queriesToReturn = response.queries;
    }
    catch (error: any) {
        console.error(error);
        queriesToReturn = [state.userInput];
    }

    return {
        queries: queriesToReturn
    };
}