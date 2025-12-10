import z from "zod";
import { State } from "../Schemas/State.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { llm } from "../llm.js";

export const claimExtractionNode = async (state: z.infer<typeof State>): Promise<Partial<z.infer<typeof State>>> => {
    const messages = [
        new SystemMessage(`
            You are a **Critical Claim Extractor**. Your task is to analyze the synthesized research report and isolate the **three (3) most critical, verifiable, and impactful factual claims** (dates, numbers, specific names, or causality statements).

            **Output Format (STRICT JSON):**
            You must output a single JSON object containing an array of the three exact claim sentences. Do not include any introductory text, explanation, or markdown formatting outside of the JSON structure.

            json
            {
                "claims": [
                    "The first most critical claim sentence.",
                    "The second most critical claim sentence.",
                    "The third most critical claim sentence."
                ]
            }
        `),
        new HumanMessage(`
            Researched Content: ${state.report}
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