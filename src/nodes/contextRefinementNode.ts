import z from "zod";
import { State } from "../Schemas/State.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { llm } from "../llm.js";
import { VectorDBSchema } from "../tools/rag.js";

export const contextRefinementNode = async (state: z.infer<typeof State>): Promise<Partial<z.infer<typeof State>>> => {
    const messages = [
        new SystemMessage(`
            You are a **Fact Distillation and Content Refinement Specialist** working on a Research Agent pipeline. Your sole task is to take raw, messy, and potentially redundant text chunks retrieved from a vector database and distill them into a concise, clean, and optimized set of facts.

            Your output will be used as the definitive source material for a final report generation step.

            **Constraints and Objectives:**
            1.  **Strictly Fact-Based:** Only include verifiable facts, statistics, dates, names, and explicit statements. DO NOT infer, speculate, or editorialize.
            2.  **Eliminate Redundancy:** Merge identical or highly similar statements from different chunks into a single, unified sentence.
            3.  **Optimize for Synthesis:** Structure the output into short, crisp, logically grouped paragraphs. The goal is to maximize information density.
            4.  **Preserve Source:** For the most critical or surprising facts, retain the original URL/Source identifier where provided in the metadata, placing it in parentheses at the end of the statement (e.g., "The project was finalized on May 1st, 2024 (Source: example.com/report)." )
            5.  **Output Format:** Output ONLY the synthesized, distilled text. Do not include any introductory phrases, titles, or closing statements.

            Your refined output must directly support answering that query.
        `),
        new HumanMessage(`
            User Query: ${state.userInput}
            Below is the researched content:
            ${state.researchedContent}
        `)
    ];

    const llmWithStructureOutput = llm.withStructuredOutput(z.array(VectorDBSchema));
    const response = await llmWithStructureOutput.invoke(messages);

    return { researchedContent: response };
}