import z from "zod";
import { State } from "../Schemas/State.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { llm } from "../llm.js";

export const simpleLlmNode = async (state: z.infer<typeof State>): Promise<Partial<z.infer<typeof State>>> => {
    const messages = [
        new SystemMessage(`
            You are a simple Q&A engine. Your task is to answer the user's question.
        `),
        new HumanMessage(state.userInput),
    ];

    const response = await llm.invoke(messages);

    return {
        report: response.text
    };
}