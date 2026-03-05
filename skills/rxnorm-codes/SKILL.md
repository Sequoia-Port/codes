---
name: rxnorm-codes
description: RxNorm drug and medication code search, NDC/RXCUI lookup, and ingredient retrieval. Activates when tasks involve drug codes, NDC numbers, medication identification, or active ingredient lookup.
license: MIT
author: SequoiaPort
version: 0.1.0
---

# RxNorm Codes

Search drugs, look up NDC/RXCUI codes, and get active ingredients via the `@sequoiaport/codes` package.

## When to Apply

- User asks for a drug code or medication identifier
- User needs to look up an NDC (National Drug Code) or RXCUI
- User wants to find active ingredients in a medication
- User mentions drug names, pharmacy codes, or medication lookup

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

### `client.rxnorm.searchCode({ query, limit? })`
Search for drugs by name.

```typescript
const results = await client.rxnorm.searchCode({
  query: "metformin",
  limit: 10,
});
// results.results → [{ rxcui, name, tty, similarity, ... }]
```

### `client.rxnorm.identifyCode({ type, code })`
Look up a drug by NDC or RXCUI.

```typescript
// By NDC
const byNdc = await client.rxnorm.identifyCode({
  type: "ndc",
  code: "0002-4112-01",
});

// By RXCUI
const byRxcui = await client.rxnorm.identifyCode({
  type: "rxcui",
  code: "861004",
});
```

### `client.rxnorm.getIngredients({ rxcui })`
Get active ingredients for a drug.

```typescript
const ingredients = await client.rxnorm.getIngredients({ rxcui: "861004" });
// ingredients.results → [{ rxcui, name, tty, ... }]
```

## REST API (curl)

```bash
# Search drugs by name
curl -X GET "https://api.sequoiacodes.com/v1/rxnorm/searchCode?query=metformin&limit=10" \
  -H "Authorization: Bearer $SEQUOIA_CODES_API_KEY"

# Lookup by NDC
curl -X GET "https://api.sequoiacodes.com/v1/rxnorm/identifyCode?type=ndc&code=0002-4112-01" \
  -H "Authorization: Bearer $SEQUOIA_CODES_API_KEY"

# Lookup by RXCUI
curl -X GET "https://api.sequoiacodes.com/v1/rxnorm/identifyCode?type=rxcui&code=861004" \
  -H "Authorization: Bearer $SEQUOIA_CODES_API_KEY"

# Get active ingredients
curl -X GET "https://api.sequoiacodes.com/v1/rxnorm/getIngredients?rxcui=861004" \
  -H "Authorization: Bearer $SEQUOIA_CODES_API_KEY"
```

## Response Fields

Drug results include:
- `rxcui` - RxNorm Concept Unique Identifier
- `name` - Drug name
- `tty` - Term Type (SCD, SBD, IN, BN, etc.)
- `suppress` - Suppression status
- `similarity` - Search relevance score (0-1)

NDC results include:
- `ndc` - National Drug Code
- `rxcui` - Mapped RXCUI
- `name` - Drug name
- `status` - Active/inactive
- `source` - Data source

## Common Term Types (TTY)

- **IN** - Ingredient
- **BN** - Brand Name
- **SCD** - Semantic Clinical Drug
- **SBD** - Semantic Branded Drug
- **SCDF** - Semantic Clinical Drug Form
- **SBDF** - Semantic Branded Drug Form
