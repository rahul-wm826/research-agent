import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import z from "zod";
import { QdrantVectorStore } from "@langchain/qdrant";
import { ScoreThresholdRetriever } from "langchain/retrievers/score_threshold";

const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "text-embedding-004",
    apiKey: process.env.GOOGLE_API_KEY,
});

const vectorStore = new QdrantVectorStore(embeddings, {
    url: process.env.QDRANT_URL,
    collectionName: "research",
    apiKey: process.env.QDRANT_API_KEY,
});

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

export const VectorDBSchema = z.object({
    content: z.string(),
    url: z.string(),
});
export type RetrieveData = z.infer<typeof VectorDBSchema>;

export async function retrieveData(query: string, scoreThreshold: number = 0.75, maxDocs: number = 5): Promise<RetrieveData[]> {
    const scoreRetriever = new ScoreThresholdRetriever({
        vectorStore,
        minSimilarityScore: scoreThreshold,
        maxK: maxDocs,
    });

    const results = await scoreRetriever.getRelevantDocuments(query);

    return results.map((doc) => ({
        content: doc.pageContent,
        url: doc.metadata.url,
    }));
}