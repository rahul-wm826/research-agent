import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import z from "zod";

const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "text-embedding-004",
    apiKey: process.env.GOOGLE_API_KEY,
});

const vectorStore = new MemoryVectorStore(embeddings);

export async function storeData(url: string, text: string) {
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });
    const chunks = await textSplitter.splitText(text);

    const documents = chunks.map((chunk) => new Document({
        pageContent: chunk,
        metadata: {
            url,
        },
    }));

    await vectorStore.addDocuments(documents);
}

export const RetrieveDataSchema = z.object({
    content: z.string(),
    url: z.string(),
});
export type RetrieveData = z.infer<typeof RetrieveDataSchema>;

export async function retrieveData(query: string): Promise<RetrieveData[]> {
    const results = await vectorStore.similaritySearch(query, 3);
    return results.map((doc) => ({
        content: doc.pageContent,
        url: doc.metadata.url,
    }));
}