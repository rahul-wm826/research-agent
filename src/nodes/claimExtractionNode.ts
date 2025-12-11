import z from "zod";
import { State } from "../Schemas/State.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { llm } from "../llm.js";

export const claimExtractionNode = async (state: z.infer<typeof State>): Promise<Partial<z.infer<typeof State>>> => {
    const messages = [
        new SystemMessage(`
            You are a **Critical Claim Extractor**. Your sole task is to analyze the provided research content and isolate the **three (3)** most impactful, verifiable, and distinct factual claims.

            **TASK PRIORITY:**
            1.  Read and understand the <RESEARCH_REPORT>.
            2.  Extract the **THREE EXACT SENTENCES** that are the most important factual claims (dates, numbers, specific names).
            3.  Output **ONLY** the JSON object.

            **CRITICAL CONSTRAINTS:**
            * **Focus:** Claims MUST be directly verifiable sentences copied from the <RESEARCH_REPORT> block. DO NOT create new sentences or generalize.
            * **Quantity:** You must provide exactly three claims.
            * **NO CONSOLIDATION:** This node does **not** consolidate. It extracts and formats.
        `),
        new HumanMessage(`
            <USER_QUERY>
            ${state.userInput}
            </USER_QUERY>

            <RESEARCH_REPORT>
            ${state.researchedContent}
            </RESEARCH_REPORT>
        `)
    ];

    const llmWithStructureOutput = llm.withStructuredOutput(z.object({
        claims: z.array(z.string()).min(3).max(3),
    }));
    const response = await llmWithStructureOutput.invoke(messages);

    return {
        claims: response.claims,
    };
}