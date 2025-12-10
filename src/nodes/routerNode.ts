import z from "zod";
import { State } from "../Schemas/State.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { llm } from "../llm.js";
import { Command } from "@langchain/langgraph";

export const routerNode = async (state: z.infer<typeof State>) => {
    const recentMessages = state.messages.slice(-5);

    const message = [
        new SystemMessage(`
            You are a conversation router. Analyze the user's latest input in the context of the recent history.
            Classify the user's intent using the provided JSON schema.
            - CONTINUATION: The latest input is a follow-up, refinement, or request for more detail on the PREVIOUS topic.
            - NEW_RESEARCH: The latest input introduces a completely new, complex topic requiring a full research loop.
            - SIMPLE_QANDA: The latest input is a direct, single-answer question (e.g., "What is your name?").
        `),
        ...recentMessages,
        new HumanMessage(`
            User Query: ${state.userInput}
        `)
    ];

    const llmWithStructureOutput = llm.withStructuredOutput(z.object({
        intent: z.enum(['CONTINUATION', 'NEW_RESEARCH', 'SIMPLE_QANDA']),
    }));

    const response = await llmWithStructureOutput.invoke(message);

    if (response.intent === 'NEW_RESEARCH') {
        return new Command({
            goto: 'searchNode'
        });
    }
    else if (response.intent === "CONTINUATION") {
        return new Command({
            goto: 'memoryCheckNode'
        });
    }
}