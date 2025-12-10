import { END, START, StateGraph } from "@langchain/langgraph";
import { State } from "./Schemas/State.js";
import { searchNode } from "./nodes/searchNode.js";
import { siteRelevanceNode } from "./nodes/siteRelevanceNode.js";
import { aggregatorNode } from "./nodes/aggregatorNode.js";
import { queryNode } from "./nodes/queryNode.js";
import { vectorSearchNode } from "./nodes/vectorSearchNode.js";
import { scrapeAndStoreNode } from "./nodes/scrapeAndStoreNode.js";
import { routerNode } from "./nodes/routerNode.js";
import { memoryCheckNode } from "./nodes/memoryCheckNode.js";
import { searchValidationNode } from "./nodes/searchValidationNode.js";
import { contextRefinementNode } from "./nodes/contextRefinementNode.js";
import { claimExtractionNode } from "./nodes/claimExtractionNode.js";
import { verificationSearchNode } from "./nodes/verificationSearchNode.js";
import { judgementNode } from "./nodes/judgementNode.js";
import { remediationNode } from "./nodes/remediationNode.js";
import { simpleLlmNode } from "./nodes/simpleLlmNode.js";

export const graph = new StateGraph(State)
    .addNode(
        "routerNode",
        routerNode,
        { ends: ["queryNode", "memoryCheckNode", "simpleLlmNode"] }
    )
    .addNode("simpleLlmNode", simpleLlmNode)
    .addNode(
        "memoryCheckNode",
        memoryCheckNode,
        { ends: ["queryNode", "aggregatorNode"] }
    )
    .addNode("queryNode", queryNode)
    .addNode("searchNode", searchNode)
    .addNode("searchValidationNode", searchValidationNode)
    .addNode("siteRelevanceNode", siteRelevanceNode)
    .addNode("scrapeAndStoreNode", scrapeAndStoreNode)
    .addNode("vectorSearchNode", vectorSearchNode)
    .addNode("contextRefinementNode", contextRefinementNode)
    .addNode("aggregatorNode", aggregatorNode)
    .addNode("claimExtractionNode", claimExtractionNode)
    .addNode("verificationSearchNode", verificationSearchNode)
    .addNode("judgementNode", judgementNode)
    .addNode("remediationNode", remediationNode)

    .addEdge(START, "routerNode")
    .addEdge("simpleLlmNode", END)
    .addEdge("queryNode", "searchNode")
    .addEdge("searchNode", "searchValidationNode")
    .addEdge("searchValidationNode", "siteRelevanceNode")
    .addEdge("siteRelevanceNode", "scrapeAndStoreNode")
    .addEdge("scrapeAndStoreNode", "vectorSearchNode")
    .addEdge("vectorSearchNode", "contextRefinementNode")
    .addEdge("contextRefinementNode", "aggregatorNode")
    .addEdge("aggregatorNode", "claimExtractionNode")
    .addEdge("claimExtractionNode", "verificationSearchNode")
    .addEdge("verificationSearchNode", "judgementNode")
    .addEdge("judgementNode", "remediationNode")
    .addEdge("remediationNode", END)
    .compile() as any;