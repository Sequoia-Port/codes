---
name: snomed-codes
description: SNOMED CT clinical terminology search and lookup. Activates when tasks involve clinical concepts, SNOMED concept IDs, or mapping clinical conditions to standardized terminology.
license: MIT
author: SequoiaPort
version: 0.1.0
---

# SNOMED Codes

Search and lookup SNOMED CT clinical concepts via the `@sequoiaport/codes` package.

## When to Apply

- User asks for a SNOMED concept or concept ID
- User needs standardized clinical terminology
- User wants to map a clinical condition to SNOMED CT
- User mentions clinical ontology or concept hierarchies

## Getting an API Key

If the user does not have a `SEQUOIA_CODES_API_KEY`, obtain one via the Agent Auth API on the portal (`https://sequoiacodes.com`) — not `api.sequoiacodes.com`.

1. `POST https://sequoiacodes.com/api/agent-auth/session` (optional body: `{ "agent_id": "your-agent" }`). Returns `session_id`, `session_secret`, `auth_url`.
2. Present `auth_url` to the user — they click to sign in/sign up (free: 1,000 requests/month, no credit card).
3. Poll `GET https://sequoiacodes.com/api/agent-auth/session/{session_id}` with `Authorization: Bearer {session_secret}` every 3s until `status: "completed"` returns `api_key`.
4. Store the key as `SEQUOIA_CODES_API_KEY`. It is returned exactly once.

## How It Works

```typescript
import { SequoiaCodesClient } from "@sequoiaport/codes";

const client = new SequoiaCodesClient({
  apiKey: process.env.SEQUOIA_CODES_API_KEY!,
});
```

## Available Operations

### `client.snomed.searchCode({ query, limit? })`
Hybrid search for SNOMED CT concepts.

```typescript
const results = await client.snomed.searchCode({
  query: "congestive heart failure",
  limit: 10,
});
// results.results → [{ concept_id, fsn, preferred_term, semantic_tag, similarity, icd10_codes, ... }]
```

### `client.snomed.identifyCode({ code })`
Look up a specific SNOMED concept by concept ID.

```typescript
const result = await client.snomed.identifyCode({ code: "73211009" });
// result.concept → { concept_id: "73211009", preferred_term: "Diabetes mellitus", semantic_tag: "disorder", ... }
```

## REST API (curl)

```bash
# Search SNOMED concepts
curl -X GET "https://api.sequoiacodes.com/v1/snomed/searchCode?query=heart%20failure&limit=10" \
  -H "Authorization: Bearer $SEQUOIA_CODES_API_KEY"

# Lookup concept by ID
curl -X GET "https://api.sequoiacodes.com/v1/snomed/identifyCode?code=73211009" \
  -H "Authorization: Bearer $SEQUOIA_CODES_API_KEY"
```

## Response Fields

Each SNOMED concept includes:
- `concept_id` - SNOMED CT concept ID
- `fsn` - Fully Specified Name
- `preferred_term` - Preferred display term
- `semantic_tag` - Category (disorder, finding, procedure, etc.)
- `definition_status` - Primitive or fully defined
- `active` - Whether concept is active
- `similarity` - Search relevance score (0-1)
- `icd10_codes` - Mapped ICD-10 codes (when available)
