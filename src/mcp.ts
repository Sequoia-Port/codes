import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { SequoiaCodesClient } from "./client";

const CODE_SYSTEMS = ["icd10", "cpt", "hcpcs", "snomed", "rxnorm", "loinc"] as const;
const GUIDELINE_SYSTEMS = ["lcd", "ncd"] as const;

const apiKey = process.env.SEQUOIA_CODES_API_KEY;
if (!apiKey) {
	console.error("SEQUOIA_CODES_API_KEY environment variable is required");
	process.exit(1);
}

const client = new SequoiaCodesClient({ apiKey });

const server = new McpServer({
	name: "sequoia-codes",
	version: "0.1.0",
});

// =============================================================================
// Tool 1: searchCode
// =============================================================================

server.tool(
	"searchCode",
	"Search medical codes by description across ICD-10, CPT, HCPCS, SNOMED, RxNorm, or LOINC systems.",
	{
		system: z.enum(CODE_SYSTEMS).describe("The coding system to search"),
		query: z.string().min(1).describe("Search text (e.g. 'diabetes', 'knee replacement')"),
		limit: z.number().int().min(1).max(200).optional().describe("Max results (1-200)"),
		billingOnly: z.boolean().optional().describe("ICD-10 only: filter to billable codes"),
	},
	async ({ system, query, limit, billingOnly }) => {
		const params: Record<string, unknown> = { query };
		if (limit !== undefined) params.limit = limit;
		if (system === "icd10" && billingOnly !== undefined) params.billingOnly = billingOnly;

		const result = await client[system].searchCode(params as never);
		return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
	},
);

// =============================================================================
// Tool 2: identifyCode
// =============================================================================

server.tool(
	"identifyCode",
	"Look up a specific medical code, get cost data, ICD-10 links, panel members, ingredients, or chapters.",
	{
		system: z.enum(CODE_SYSTEMS).describe("The coding system"),
		code: z.string().default("").describe("The code to look up (not needed for getChapters)"),
		type: z.enum(["ndc", "rxcui"]).optional().describe("RxNorm only: lookup type"),
		action: z
			.enum(["lookup", "getCost", "linkIcd10", "getPanelMembers", "getIngredients", "getChapters"])
			.default("lookup")
			.describe(
				"lookup (default), getCost (CPT/HCPCS), linkIcd10 (CPT), getPanelMembers (LOINC), getIngredients (RxNorm), getChapters (ICD-10)",
			),
	},
	async ({ system, code, type, action }) => {
		let result: unknown;

		switch (action) {
			case "getCost":
				if (system !== "cpt" && system !== "hcpcs") {
					return { content: [{ type: "text" as const, text: "getCost is only available for cpt and hcpcs systems" }] };
				}
				result = await client[system].getCost({ code });
				break;

			case "linkIcd10":
				if (system !== "cpt") {
					return { content: [{ type: "text" as const, text: "linkIcd10 is only available for the cpt system" }] };
				}
				result = await client.cpt.linkIcd10({ code });
				break;

			case "getPanelMembers":
				if (system !== "loinc") {
					return { content: [{ type: "text" as const, text: "getPanelMembers is only available for the loinc system" }] };
				}
				result = await client.loinc.getPanelMembers({ code });
				break;

			case "getIngredients":
				if (system !== "rxnorm") {
					return { content: [{ type: "text" as const, text: "getIngredients is only available for the rxnorm system" }] };
				}
				result = await client.rxnorm.getIngredients({ rxcui: code });
				break;

			case "getChapters":
				if (system !== "icd10") {
					return { content: [{ type: "text" as const, text: "getChapters is only available for the icd10 system" }] };
				}
				result = await client.icd10.getChapters();
				break;

			default: {
				// lookup
				if (system === "rxnorm") {
					result = await client.rxnorm.identifyCode({ type: type ?? "rxcui", code });
				} else {
					result = await client[system].identifyCode({ code } as never);
				}
				break;
			}
		}

		return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
	},
);

// =============================================================================
// Tool 3: searchGuidelines
// =============================================================================

server.tool(
	"searchGuidelines",
	"Search or look up Medicare coverage guidelines (LCD/NCD). Provide query to search, or id/section to look up a specific guideline.",
	{
		system: z.enum(GUIDELINE_SYSTEMS).describe("lcd (Local Coverage) or ncd (National Coverage)"),
		query: z.string().optional().describe("Search text for guidelines"),
		id: z.string().optional().describe("Guideline ID for direct lookup"),
		section: z.string().optional().describe("NCD only: section number (e.g. '220.6')"),
		limit: z.number().int().min(1).max(200).optional().describe("Max results (1-200)"),
	},
	async ({ system, query, id, section, limit }) => {
		let result: unknown;

		if (query) {
			const params: Record<string, unknown> = { query };
			if (limit !== undefined) params.limit = limit;
			result = await client[system].searchGuidelines(params as never);
		} else if (id || section) {
			if (system === "ncd") {
				result = await client.ncd.identifyGuideline({ id, section });
			} else {
				if (!id) {
					return { content: [{ type: "text" as const, text: "LCD lookup requires an id" }] };
				}
				result = await client.lcd.identifyGuideline({ id });
			}
		} else {
			return { content: [{ type: "text" as const, text: "Provide either query (to search) or id/section (to look up a specific guideline)" }] };
		}

		return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
	},
);

// =============================================================================
// Tool 4: ndcLookup
// =============================================================================

server.tool(
	"ndcLookup",
	"Look up, search, or explore the FDA NDC Directory. Actions: lookup (by NDC code), lookupBatch (multiple NDCs), search (by drug name), fuzzy (misspelling-tolerant search), getProduct (by product NDC), getLabeler (by manufacturer), getPackages (by product NDC), crossRef (NDC-to-RxNorm).",
	{
		action: z
			.enum(["lookup", "lookupBatch", "search", "fuzzy", "getProduct", "getLabeler", "getPackages", "crossRef", "stats"])
			.default("lookup")
			.describe("The NDC action to perform"),
		ndc: z.string().optional().describe("NDC code (for lookup, crossRef)"),
		ndcs: z.array(z.string()).optional().describe("Array of NDC codes (for lookupBatch)"),
		query: z.string().optional().describe("Drug name to search (for search, fuzzy)"),
		productNdc: z.string().optional().describe("Product NDC in 5-4 format (for getProduct, getPackages)"),
		labeler: z.string().optional().describe("Manufacturer name (for getLabeler)"),
		productType: z.string().optional().describe("Filter by product type (for search)"),
		limit: z.number().int().min(1).max(100).optional().describe("Max results"),
	},
	async ({ action, ndc, ndcs, query, productNdc, labeler, productType, limit }) => {
		let result: unknown;

		switch (action) {
			case "lookup":
				if (!ndc) return { content: [{ type: "text" as const, text: "ndc is required for lookup" }] };
				result = await client.ndc.lookupNdc({ ndc });
				break;
			case "lookupBatch":
				if (!ndcs || ndcs.length === 0) return { content: [{ type: "text" as const, text: "ndcs array is required for lookupBatch" }] };
				result = await client.ndc.lookupBatch({ ndcs });
				break;
			case "search":
				if (!query) return { content: [{ type: "text" as const, text: "query is required for search" }] };
				result = await client.ndc.searchProducts({ query, productType, limit });
				break;
			case "fuzzy":
				if (!query) return { content: [{ type: "text" as const, text: "query is required for fuzzy search" }] };
				result = await client.ndc.searchFuzzy({ query, limit });
				break;
			case "getProduct":
				if (!productNdc) return { content: [{ type: "text" as const, text: "productNdc is required for getProduct" }] };
				result = await client.ndc.getProduct({ productNdc });
				break;
			case "getLabeler":
				if (!labeler) return { content: [{ type: "text" as const, text: "labeler is required for getLabeler" }] };
				result = await client.ndc.getLabeler({ labeler, limit });
				break;
			case "getPackages":
				if (!productNdc) return { content: [{ type: "text" as const, text: "productNdc is required for getPackages" }] };
				result = await client.ndc.getPackages({ productNdc });
				break;
			case "crossRef":
				if (!ndc) return { content: [{ type: "text" as const, text: "ndc is required for crossRef" }] };
				result = await client.ndc.crossRefRxcui({ ndc });
				break;
			case "stats":
				result = await client.ndc.getStats();
				break;
		}

		return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
	},
);

// =============================================================================
// Start
// =============================================================================

async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
}

main().catch((err) => {
	console.error("MCP server failed to start:", err);
	process.exit(1);
});
