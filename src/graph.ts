import { END, START, StateGraph } from "@langchain/langgraph";
import { State } from "./Schemas/State.js";
import { searchNode } from "./nodes/searchNode.js";
import { urlRelevanceNode } from "./nodes/urlRelevanceNode.js";
import { aggregatorNode } from "./nodes/aggregatorNode.js";
import { queryNode } from "./nodes/queryNode.js";
import { vectorSearchNode } from "./nodes/vectorSearchNode.js";
import { scrapeNode } from "./nodes/scrapeNode.js";

export const graph = new StateGraph(State)
    .addNode("queryNode", queryNode)
    .addNode("searchNode", searchNode)
    .addNode("urlRelevanceNode", urlRelevanceNode)
    .addNode("scrapeNode", scrapeNode)
    .addNode("vectorSearchNode", vectorSearchNode)
    .addNode("aggregatorNode", aggregatorNode)
    .addEdge(START, "queryNode")
    .addEdge("queryNode", "searchNode")
    .addEdge("searchNode", "urlRelevanceNode")
    .addEdge("urlRelevanceNode", "scrapeNode")
    .addEdge("scrapeNode", "vectorSearchNode")
    .addEdge("vectorSearchNode", "aggregatorNode")
    .addEdge("aggregatorNode", END)
    .compile() as any;