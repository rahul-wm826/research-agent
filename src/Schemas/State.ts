import z from "zod";
import { OrganicResultSchema } from "./Search.js";
import { VectorDBSchema } from "../tools/rag.js";
import { BaseMessage } from "@langchain/core/messages";
import { FactCheckSearchSchema } from "../nodes/verificationSearchNode.js";
import { Verdicts } from "../nodes/judgementNode.js";

export const State = z.object({
    userInput: z.string(),
    queries: z.array(z.string()),
    relevantUrls: z.array(z.string()),
    searchResult: OrganicResultSchema.array(),
    researchedContent: VectorDBSchema.array(),
    claims: z.array(z.string()),
    factCheckSearch: z.array(FactCheckSearchSchema),
    verdicts: Verdicts.array(),
    report: z.string(),
    messages: z.array(z.instanceof(BaseMessage)).default([]),
});