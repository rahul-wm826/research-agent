import z from "zod";
import { OrganicResultSchema } from "./Search.js";
import { RetrieveDataSchema } from "../tools/rag.js";
import { BaseMessage } from "@langchain/core/messages";

export const State = z.object({
    userInput: z.string(),
    queries: z.array(z.string()),
    relevantUrls: z.array(z.string()),
    searchResult: OrganicResultSchema.array(),
    researchedContent: RetrieveDataSchema.array(),
    report: z.string(),
    messages: z.array(z.instanceof(BaseMessage)).default([]),
});