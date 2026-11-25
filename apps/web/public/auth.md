# AIBlockList Agent Authentication (`auth.md`)

> AIBlockList provides open, unauthenticated read access to its public behavioral spam registry and requires cryptographic ownership verification + Cloudflare Turnstile for account appeals.

## Public Read Endpoints (No Auth Required)

- `GET https://aiblocklist.com/api/v1/health`
- `GET https://aiblocklist.com/api/v1/statistics`
- `GET https://aiblocklist.com/api/v1/blocklists?platform=x&limit=24`
- `GET https://aiblocklist.com/api/v1/accounts/{platform}/{username}`
- `GET https://aiblocklist.com/api/v1/blocklists/export?format=json`

## Protected Appeal Flow (Account Owners Only)

1. **Initiate Challenge:** `POST https://aiblocklist.com/api/v1/appeals/verify/init` with `{ platform, username, method, turnstile_token }`.
2. **Prove Account Control:** Either post a public appeal tweet mentioning `https://aiblocklist.com` or place the single-use `aibl-verify-*` token in your public profile bio.
3. **Confirm Ownership:** `POST https://aiblocklist.com/api/v1/appeals/verify/confirm` to receive a single-use, 1-hour `appellant_session_token`.
4. **Submit Appeal:** `POST https://aiblocklist.com/api/v1/appeals` with header `X-Appellant-Session: <appellant_session_token>`.

## Discovery Links

- OAuth Authorization Server: `https://aiblocklist.com/.well-known/oauth-authorization-server`
- OAuth Protected Resource: `https://aiblocklist.com/.well-known/oauth-protected-resource`
- API Catalog: `https://aiblocklist.com/.well-known/api-catalog`
