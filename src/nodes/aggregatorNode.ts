import z from "zod";
import { State } from "../Schemas/State.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { llm } from "../llm.js";
import fs from "node:fs/promises";

export const aggregatorNode = async (state: z.infer<typeof State>): Promise<Partial<z.infer<typeof State>>> => {
    const messages = [
        new SystemMessage(`
            You are an expert **Aggregation and Synthesis Engine**. Your task is to review the research content provided in the JSON array below, identify key findings, eliminate all redundancy, and structure the information into a single, crisp, unified, coherent, and professional research report.

            **Report Constraints:**
            1.  **Audience:** **[Target Audience, e.g., Senior Management, Technical Team, Academic Peers]**
            2.  **Focus:** **[Primary Research Topic]**
            3.  **Format:** The entire output must be formatted using **Markdown**.
            4.  **Length:** The report must be concise and crisp, aiming for a total length of approximately **1,500 to 2,000 words**.

            **Report Structure (Must Include):**
            * **Executive Summary:** A brief, high-level overview of the most critical findings and the main conclusion.
            * **Introduction:** Define the scope and objective of the research.
            * **Key Findings & Analysis (The Core):** A structured breakdown using clear headings (H2/H3) and bullet points where appropriate, synthesizing data from across all input documents.
                * *Focus on connecting disparate fragments into coherent insights.*
                * *Include quantifiable data points where available.*
            * **Challenges and Risks:** Summarize any obstacles, contradictions, or risks identified in the source material.
            * **Conclusion & Recommendations:** A summary of the synthesis and specific, actionable steps for the **[Target Audience]** based on the consolidated evidence.

            **Input Content:**
            Review the following array of research documents.

            ${JSON.stringify(state.researchedContent)}
        `),
        new HumanMessage(`
            User Query: ${state.userInput}
            Below is the researched content:
            ${JSON.stringify(state.researchedContent)}
        `),
    ];

    const llmWithStructureOutput = llm.withStructuredOutput(z.object({
        report: z.string(),
    }));

    const response = await llmWithStructureOutput.invoke(messages);

    await fs.writeFile('report.txt', response.report);

    console.log('Report saved to report.txt');

    return {
        report: response.report
    };
}