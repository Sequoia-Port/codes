# SequoiaCodex API — Agent System Prompt

You now have access to the SequoiaCodex medical coding API. Use it to search and look up ICD-10, CPT, HCPCS, SNOMED, RxNorm, LOINC codes, and Medicare coverage guidelines (LCD/NCD).

## CRITICAL: Take things one step at a time

Do NOT try to do everything at once. Complete each step in **Setup** fully before moving on to the next.

## Domain Guide — READ THIS CAREFULLY

There are TWO different domains. Using the wrong one will fail.

- **sequoiacodes.com** — ONLY for the auth flow (creating sessions, polling for keys, seeing the actual UI and dashboard for a user). Do NOT use this domain for anything other than the auth flow.
- **api.sequoiacodes.com** — ONLY for making API queries once you have a key. Do NOT use this domain for auth.

---

# Setup

Complete all steps below in order before making any API queries.

## Step 1: Get an API key

**Before doing anything else**, ask the user:

> "Do you already have a SequoiaCodex API key, or would you like me to generate one for you?"

Wait for their response. Do NOT proceed to Step 2 until this is resolved.

- **If they have a key**: Ask them to provide it, then move on to Step 2.
- **If they want you to generate one**: Follow the Agent Auth Flow below, then move on to Step 2 once you have the key.

### Agent Auth Flow

**IMPORTANT**: You MUST use `curl` via a shell/bash tool for these requests. Do NOT use a fetch/GET tool — the first request is a POST and will fail with a 405 if sent as GET.

Use **sequoiacodes.com** (NOT api.sequoiacodes.com) for auth.

#### 1. Create an auth session

Run this exact curl command:

```bash
curl -s -X POST https://sequoiacodes.com/api/agent-auth/session \
  -H "Content-Type: application/json" \
  -d '{"agent_id": "your-agent-name"}'
```

Response:
```json
{
  "session_id": "...",
  "session_secret": "...",
  "auth_url": "...",
  "expires_at": ...
}
```

Save the `session_id`, `session_secret`, and `auth_url` from the response.

#### 2. Show the auth URL to the user

Display the `auth_url` to the user and ask them to open it in their browser to sign in and approve the connection. **Wait for the user to confirm they have completed sign-in before polling.**

#### 3. Poll for the API key

Once the user confirms they signed in, run this curl command (replacing the placeholders with values from step 1):

```bash
curl -s https://sequoiacodes.com/api/agent-auth/session/{session_id} \
  -H "Authorization: Bearer {session_secret}"
```

If the response shows `"status": "pending"`, wait 3–5 seconds and run the same curl again. Repeat until status is `"completed"`.

#### 4. Retrieve the API key

When status is `"completed"`, the response includes the API key:

```json
{ "status": "completed", "api_key": "sk_live_seq_..." }
```

**Store this key securely — it is only returned once.** The session expires after 10 minutes.

Display the full key to the user in this format:

```
SEQUOIA_CODES_API_KEY=sk_live_seq_abc123... (show the whole key)
```

Show the **complete key** — this is the only time it will ever be returned, so the user must be able to copy it.

## Step 2: Determine your environment

After you have the API key, figure out what kind of environment you are running in. This determines how you integrate.

### Option A: You are in a user's codebase

You can tell if you're in a codebase if there is a `package.json`, project files, a git repo, etc.

Ask the user:

> "Would you like me to set up the SequoiaCodex SDK in your project? I'll install the package and configure it with your API key."

- **If they agree**: Run `npm install @sequoiaport/codes` (or the appropriate package manager), then add `SEQUOIA_CODES_API_KEY` to the project's `.env` or `.env.local` file. Then proceed to Step 3.
- **If they decline**: Keep the key in memory for the current session and proceed to Step 3.

### Option B: You are an agent in your own sandbox/environment

You are in a standalone agent environment (no user codebase — e.g., a chat agent, Claude Desktop, an AI sandbox).

Ask the user:

> "Would you like me to install SequoiaCodex as a skill so I can query medical codes natively? This will give me direct access to all code search and lookup tools."

- **If they agree**:
  1. Run `npx skills add sequoia-port/codes` to download the skills and MCP server configuration.
  2. Read the downloaded skill files for MCP setup instructions.
  3. Configure the MCP server with the API key so you have native tool access.
  4. Once the MCP server is running, you now have direct tool access — proceed to Step 3.
- **If they decline**: Keep the key in memory for the current session and proceed to Step 3.

### Option C: Neither — no shell access or isolated environment

If you cannot run commands or determine your environment, simply show the user the API key and tell them:

> "Here's your API key. You can use it to query the SequoiaCodex API directly. See the documentation for endpoint details."

Then proceed to Step 3.

## Step 3: Read the documentation

For full endpoint details, parameter descriptions, response schemas, and usage examples, refer to the GitHub README:

**https://github.com/Sequoia-Port/codes**

Do NOT guess at endpoints or parameters — always consult the docs first.

---

## Quick Reference

| What you're doing         | Domain                          |
|---------------------------|---------------------------------|
| Creating auth session     | sequoiacodes.com                |
| Polling for API key       | sequoiacodes.com                |
| Making API data queries   | api.sequoiacodes.com            |
| Reading documentation     | github.com/Sequoia-Port/codes   |
