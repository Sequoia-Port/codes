---
name: icd-10-codes
description: ICD-10 diagnosis code search and lookup. Activates when tasks involve finding diagnosis codes, billing codes, or mapping clinical conditions to ICD-10 codes.
license: MIT
author: SequoiaPort
version: 0.1.0
---

# ICD-10 Codes

Search and lookup ICD-10 diagnosis codes via the `@sequoiaport/codes` package.

## When to Apply

- User asks for an ICD-10 code
- User needs a diagnosis code for a clinical condition
- User mentions billing codes or diagnosis coding
- User wants to browse ICD-10 chapters

## Getting an API Key

First check if `SEQUOIA_CODES_API_KEY` is already set in the environment. If it is, skip key generation entirely and proceed to usage. Only if no key exists, see [AGENT_PROMPT.md](../../AGENT_PROMPT.md) for how your agent can obtain one via the agent auth flow.

## MCP Server

Once you have an API key, you can set up the MCP server for direct tool access from Claude Code, Cursor, or VS Code. See [MCP_SETUP.md](../../MCP_SETUP.md).

## How It Works

```typescript
import { SequoiaCodesClient } from "@sequoiaport/codes";

const client = new SequoiaCodesClient({
  apiKey: process.env.SEQUOIA_CODES_API_KEY!,
});
```

## Available Operations

### `client.icd10.searchCode({ query, limit?, billingOnly? })`
Hybrid search for ICD-10 codes by clinical description.

```typescript
const results = await client.icd10.searchCode({
  query: "type 2 diabetes mellitus",
  limit: 10,
  billingOnly: true, // only return billable codes
});
// results.results → [{ code, short_description, long_description, is_billable, similarity, ... }]
```

### `client.icd10.identifyCode({ code })`
Look up a specific ICD-10 code.

```typescript
const result = await client.icd10.identifyCode({ code: "E11.9" });
// result.result → { code: "E11.9", short_description: "Type 2 diabetes mellitus without complications", chapter, block, is_billable, ... }
```

### `client.icd10.getChapters()`
Get all 21 ICD-10 chapters with code ranges.

```typescript
const chapters = await client.icd10.getChapters();
// chapters.chapters → [{ chapter_code: "1", chapter_description: "Certain infectious and parasitic diseases", code_range: "A00-B99" }, ...]
```

## REST API (curl)

```bash
# Search ICD-10 codes
curl -X GET "https://api.sequoiacodes.com/v1/icd10/searchCode?query=diabetes&limit=10" \
  -H "Authorization: Bearer $SEQUOIA_CODES_API_KEY"

# Search billable codes only
curl -X GET "https://api.sequoiacodes.com/v1/icd10/searchCode?query=diabetes&billingOnly=true&limit=20" \
  -H "Authorization: Bearer $SEQUOIA_CODES_API_KEY"

# Lookup specific code
curl -X GET "https://api.sequoiacodes.com/v1/icd10/identifyCode?code=E11.9" \
  -H "Authorization: Bearer $SEQUOIA_CODES_API_KEY"

# Get all chapters
curl -X GET "https://api.sequoiacodes.com/v1/icd10/getChapters" \
  -H "Authorization: Bearer $SEQUOIA_CODES_API_KEY"
```

## Response Fields

Each ICD-10 code result includes:
- `code` - The ICD-10 code (e.g., "E11.9")
- `short_description` - Brief description
- `long_description` - Full description
- `chapter` / `chapter_description` - Chapter info
- `block` / `block_description` - Block info
- `category` / `subcategory` - Category breakdown
- `is_billable` - Whether the code is valid for billing
- `valid_for_submission` - Whether valid for claims submission
- `similarity` - Search relevance score (0-1)
