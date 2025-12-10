import { z } from "zod";

export const SitelinkSchema = z.object({
    title: z.string(),
    link: z.string().url(),
}).partial();

export const AttributeSchema = z.record(z.string(), z.string()).optional();

export const RelatedSearchSchema = z.object({
    query: z.string(),
});

export const PeopleAlsoAskSchema = z.object({
    question: z.string(),
    snippet: z.string(),
    title: z.string(),
    link: z.string().url(),
});

export const SearchParametersSchema = z.object({
    q: z.string(),
    gl: z.string(),
    hl: z.string(),
    autocorrect: z.boolean(),
    page: z.number(),
    type: z.string(),
});

export const KnowledgeGraphSchema = z.object({
    title: z.string(),
    type: z.string().optional(),
    website: z.string().url().optional(),
    imageUrl: z.string().url().optional(),
    description: z.string(),
    descriptionSource: z.string().optional(),
    descriptionLink: z.string().url().optional(),
    attributes: z.record(z.string(), z.string()).optional(),
}).partial();

export const OrganicResultSchema = z.object({
    title: z.string(),
    link: z.string().url(),
    snippet: z.string(),
    sitelinks: z.array(SitelinkSchema).optional(),
    attributes: AttributeSchema,
    date: z.string().optional(),
    position: z.number(),
}).partial();

export const SearchSchema = z.object({
    searchParameters: SearchParametersSchema,
    knowledgeGraph: KnowledgeGraphSchema.optional(),
    peopleAlsoAsk: z.array(PeopleAlsoAskSchema).optional(),
    organic: z.array(OrganicResultSchema),
    relatedSearches: z.array(RelatedSearchSchema).optional(),
}).passthrough();


