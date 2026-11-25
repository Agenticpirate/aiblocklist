import { NextResponse } from "next/server";

export async function GET() {
  const metadata = {
    issuer: "https://aiblocklist.com",
    authorization_endpoint: "https://aiblocklist.com/appeals",
    token_endpoint: "https://aiblocklist.com/api/v1/appeals/verify/confirm",
    jwks_uri: "https://aiblocklist.com/.well-known/jwks.json",
    registration_endpoint: "https://aiblocklist.com/api/v1/appeals/verify/init",
    response_types_supported: ["token"],
    grant_types_supported: ["client_credentials"],
    scopes_supported: ["read:blocklists", "read:accounts", "write:appeals", "write:reports"],
    token_endpoint_auth_methods_supported: ["none"],
    agent_auth: {
      version: "1.0",
      auth_md: "https://aiblocklist.com/auth.md",
      register_uri: "https://aiblocklist.com/api/v1/appeals/verify/init",
      supported_identity_types: ["x_bio_token", "x_public_tweet", "threads_bio_token"],
      credential_types: ["appellant_session_token"],
      claim_url: "https://aiblocklist.com/appeals",
      revocation_url: "https://aiblocklist.com/api/v1/appeals",
    },
  };

  return NextResponse.json(metadata, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
