import z from "zod";
import { State } from "../Schemas/State.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { llm } from "../llm.js";

export const contextRefinementNode = async (state: z.infer<typeof State>): Promise<Partial<z.infer<typeof State>>> => {
    const systemInstruction = `
        You are a **Fact Distillation and Content Refinement Specialist** for a research pipeline. 
        Your task is to perform a single, critical operation: SYNTHESIZE the provided raw text.

        **Task Sequence:**
        1.  READ the entire content in the <RAW_CONTENT> block.
        2.  CONSOLIDATE all facts related to the User Query into a single, cohesive narrative.
        3.  OUTPUT ONLY the resulting JSON object as defined by the schema.

        **CRITICAL CONSTRAINTS:**
        * **REDUNDANCY:** MERGE all identical or highly similar statements. Do not repeat facts.
        * **SOURCE PRESERVATION:** For critical facts, retain the original (URL/Source identifier) in parentheses at the end of the statement.
        * **OUTPUT:** You MUST output a single JSON object. DO NOT include any text, titles, or explanations outside the JSON block.
    `;

    const messages = [
        new HumanMessage(`
            ${systemInstruction}
            
            --- INPUT START ---
            User Query: ${state.userInput}
            Researched Content to Refine:
            ${state.researchedContent}
            --- INPUT END ---
        `)
    ];

    const llmWithStructureOutput = llm.withStructuredOutput(z.object({
        content: z.string()
    }));
    const response = await llmWithStructureOutput.invoke(messages);

    return { refinedContent: response.content };
}