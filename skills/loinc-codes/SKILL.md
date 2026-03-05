---
name: loinc-codes
description: LOINC laboratory test code search, lookup, and panel member retrieval. Activates when tasks involve lab tests, laboratory codes, test panels, or lab ordering.
license: MIT
author: SequoiaPort
version: 0.1.0
---

# LOINC Codes

Search, lookup, and explore lab test panels via the `@sequoiaport/codes` package.

## When to Apply

- User asks for a LOINC code or lab test code
- User needs to find codes for laboratory tests
- User wants to know what tests are in a panel (e.g., CMP, CBC)
- User mentions lab ordering, test results, or specimen types

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

### `client.loinc.searchCode({ query, limit? })`
Hybrid search for LOINC laboratory test codes.

```typescript
const results = await client.loinc.searchCode({
  query: "hemoglobin A1c",
  limit: 10,
});
// results.results → [{ loinc_num, long_common_name, component, system, scale_type, similarity, ... }]
```

### `client.loinc.identifyCode({ code })`
Look up a specific LOINC code.

```typescript
const result = await client.loinc.identifyCode({ code: "4548-4" });
// result.result → { loinc_num: "4548-4", long_common_name: "Hemoglobin A1c/Hemoglobin.total in Blood", ... }
```

### `client.loinc.getPanelMembers({ code })`
Get all tests in a laboratory panel.

```typescript
const panel = await client.loinc.getPanelMembers({ code: "24323-8" });
// panel.members → [{ member_loinc, member_name, sequence, observation_required, ... }]
```

## REST API (curl)

```bash
# Search LOINC codes
curl -X GET "https://api.sequoiacodes.com/v1/loinc/searchCode?query=hemoglobin%20A1c&limit=10" \
  -H "Authorization: Bearer $SEQUOIA_CODES_API_KEY"

# Lookup specific code
curl -X GET "https://api.sequoiacodes.com/v1/loinc/identifyCode?code=2339-0" \
  -H "Authorization: Bearer $SEQUOIA_CODES_API_KEY"

# Get panel members
curl -X GET "https://api.sequoiacodes.com/v1/loinc/getPanelMembers?code=24323-8" \
  -H "Authorization: Bearer $SEQUOIA_CODES_API_KEY"
```

## Response Fields

Each LOINC code includes:
- `loinc_num` - LOINC number (e.g., "4548-4")
- `component` - What is measured
- `property` - Measurement property (mass, number, etc.)
- `time_aspect` - Point in time vs. over time
- `system` - Specimen type (blood, urine, etc.)
- `scale_type` - Quantitative, ordinal, nominal, etc.
- `method_type` - Measurement method
- `long_common_name` - Full display name
- `class` - LOINC class (CHEM, HEM, etc.)
- `similarity` - Search relevance score (0-1)
