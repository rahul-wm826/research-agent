
import z from "zod";
import { State } from "../Schemas/State.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { llm } from "../llm.js";
import { FactCheckSearch } from "./verificationSearchNode.js";

export const Verdicts = z.object({
    claim: z.string(),
    verificationStatus: z.enum(["TRUE", "FALSE", "UNCLEAR"]),
    correctionNeeded: z.string().optional().nullable(),
});

async function judgeClaim(claim: FactCheckSearch): Promise<z.infer<typeof Verdicts>> {
    const messages = [
        new SystemMessage(`
            You are a **Verdict Auditor**. Your sole task is to rigorously compare a single factual claim against the external search evidence provided below. You must not use external tools or your own knowledge.

            **Procedure:**
            1.  **Analyze:** Compare the original 'Claim' directly against the 'Evidence Snippets' and 'Knowledge Graph Data'.
            2.  **Determine Status:**
                * Set **VERIFICATION_STATUS** to "TRUE" if the evidence overwhelmingly supports the claim.
                * Set **VERIFICATION_STATUS** to "FALSE" if the evidence directly contradicts the claim.
                * Set **VERIFICATION_STATUS** to "UNCLEAR" if the evidence is insufficient, contradictory, or too vague to make a determination.
            3.  **Provide Correction:** If the status is "FALSE," extract the corrected information directly from the evidence snippets.

            **Output Format (STRICT JSON):**
            You must output ONLY a JSON object containing the verdict for the single claim reviewed. Do not include any introductory text, explanation, or markdown formatting outside of the JSON structure.

            json
            {
                "claim": "The claim to be judged.",
                "verificationStatus": "TRUE" | "FALSE" | "UNCLEAR",
                "correctionNeeded": "If FALSE, provide the correct factual statement based on the evidence. If TRUE or UNCLEAR, write 'None'."
            }
        `),
        new HumanMessage(`
            Claim: ${claim.claim}
            Evidence Snippets: ${JSON.stringify(claim.organicResults)}
            Knowledge Graph Data: ${claim.knowledgeGraph}
        `)
    ];

    const llmWithStructureOutput = llm.withStructuredOutput(Verdicts);

    return await llmWithStructureOutput.invoke(messages);
}

export const judgementNode = async (state: z.infer<typeof State>): Promise<Partial<z.infer<typeof State>>> => {
    const verdicts = [];
    for (const claim of state.factCheckSearch) {
        const verdict = await judgeClaim(claim);
        verdicts.push(verdict);
    }
    return {
        verdicts
    };
}