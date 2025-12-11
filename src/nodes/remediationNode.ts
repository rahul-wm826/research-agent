import z from "zod";
import { State } from "../Schemas/State.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { llm } from "../llm.js";

export const remediationNode = async (state: z.infer<typeof State>): Promise<Partial<z.infer<typeof State>>> => {
    const messages = [
        new HumanMessage(`
            You are a strictly procedural text processor. Your task is ONLY to execute the following surgical text replacement operation.

            **INPUT DATA:**
            The input consists of two parts: 
            1. A full **REPORT** that needs corrections.
            2. A list of **VERDICTS** (claims, corrections, statuses).

            **THE TASK:**
            For every claim in the **VERDICTS** list where the status is **"FALSE"**:
            1. FIND the original "claim_text" in the **REPORT**.
            2. REPLACE that exact sentence with the text from "correction_needed".
            3. IGNORE claims marked "TRUE" or "UNCLEAR."

            **OUTPUT RULE:**
            Output ONLY the single, final, fully revised report text. Do not include any JSON, titles, or conversational text. Output must begin immediately after the final marker.

            --- INPUT START ---
            
            **Synthesized Report to be Corrected:**
            ${JSON.stringify(state.report)}

            **Verification Verdicts and Corrections (Claim, Correction, Verdict):**
            ${JSON.stringify(state.verdicts)} 
            
            --- OUTPUT ONLY THE CORRECTED REPORT TEXT BELOW ---
        `)
    ];

    const llmWithStructuredOutput = llm.withStructuredOutput(z.object({
        report: z.string(),
    }));
    const response = await llmWithStructuredOutput.invoke(messages);

    return {
        report: response.report,
        messages: [
            ...state.messages,
            new SystemMessage(response.report)
        ]
    };
}   