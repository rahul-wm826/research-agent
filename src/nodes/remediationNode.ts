import z from "zod";
import { State } from "../Schemas/State.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { llm } from "../llm.js";

export const remediationNode = async (state: z.infer<typeof State>): Promise<Partial<z.infer<typeof State>>> => {
    const messages = [
        new SystemMessage(`
            You are a **Report Remediation Specialist**. Your task is to perform targeted, surgical edits on the synthesized research report using a strict set of verification verdicts and corrections provided below.

            Your goal is to correct all claims marked as "FALSE" without altering the report's overall structure, tone, or content beyond the necessary factual substitution.

            **Procedure:**
            1.  **Surgical Edit:** For every claim marked with "verification_status": "FALSE" in the 'Verification Verdicts' JSON, locate the exact original "claim_text" in the report. **Replace that original claim entirely** with the text provided in the corresponding "correction_needed" field.
            2.  **Preserve:** Ignore claims marked "TRUE" or "UNCLEAR." Do not modify the report in response to these statuses.
            3.  **Output Format:** Output **ONLY** the single, revised, corrected version of the full synthesized report. Do not include any JSON, notes, explanation, or conversational text.
        `),
        new HumanMessage(`
            Synthesized Report to be Corrected: 
            ${state.report}

            Verification Verdicts and Corrections:
            ${state.verdicts}
        `)
    ];

    const response = await llm.invoke(messages);

    return {
        report: response.text,
        messages: [
            ...state.messages,
            new SystemMessage(response.text)
        ]
    };
}   