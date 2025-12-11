import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";

function model() {
    let llm: ChatOpenAI | ChatGoogleGenerativeAI;

    if (process.env.MODEL === "mistral") {
        const OPENROUTER_MODEL = "google/gemma-3-27b-it:free";
        // const OPENROUTER_MODEL = "mistralai/mistral-7b-instruct:free";
        const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

        llm = new ChatOpenAI({
            model: OPENROUTER_MODEL,
            temperature: 0.1,

            apiKey: process.env.OPENROUTER_API_KEY,

            configuration: {
                baseURL: OPENROUTER_BASE_URL,

                defaultHeaders: {
                    "HTTP-Referer": process.env.OPENROUTER_REFERRER,
                    "X-Title": "LangGraph Research Agent",
                },
            },
        });
    }
    else {
        llm = new ChatGoogleGenerativeAI({
            model: "gemini-2.0-flash-lite",
            temperature: 0.1,
            apiKey: process.env.GOOGLE_API_KEY,
        });
    }
    return llm;
}

export const llm = model();
