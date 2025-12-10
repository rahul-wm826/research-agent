import z from "zod";
import { State } from "../Schemas/State.js";
import { retrieveData } from "../tools/rag.js";
import { Command } from "@langchain/langgraph";

export const memoryCheckNode = async (state: z.infer<typeof State>) => {
    const userQuery = state.userInput;

    const data = await retrieveData(userQuery, 0.95, 5);

    if (data) {
        return new Command({
            update: { researchedContent: data },
            goto: 'aggregatorNode'
        });
    }
    return new Command({
        goto: 'queryNode'
    });
};
