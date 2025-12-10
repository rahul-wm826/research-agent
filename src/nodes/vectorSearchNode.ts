import z from "zod";
import { State } from "../Schemas/State.js";
import { retrieveData } from "../tools/rag.js";

export const vectorSearchNode = async (state: z.infer<typeof State>): Promise<Partial<z.infer<typeof State>>> => {
    const queries = state.queries;

    const results = await Promise.all(queries.map((query: string) => retrieveData(query)));
    const flattenedResults = results.flatMap(result => result);

    return {
        researchedContent: flattenedResults
    };
}