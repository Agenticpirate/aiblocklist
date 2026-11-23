"use client";

import { useState } from "react";
import { CheckCircle, WarningCircle, Scales, Key } from "@phosphor-icons/react";
import { fetchApi } from "@/lib/api";

interface ChallengeInit {
  challenge_id: string;
  account_username: string;
  platform_account_id: string | null;
  verification_token: string;
  expires_at: string;
  instructions: string;
}

interface AppealConfirmation {
  appeal_id: string;
  status: string;
  triage_target_date: string;
  sla_target_date: string;
  scope_notice: string;
}

export default function AppealsPage() {
  const [platform, setPlatform] = useState<"x" | "threads">("x");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [username, setUsername] = useState("");
  const [challenge, setChallenge] = useState<ChallengeInit | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [statement, setStatement] = useState("");
  const [confirmation, setConfirmation] = useState<AppealConfirmation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startChallenge(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetchApi<ChallengeInit>("/appeals/verify/init", {
        method: "POST",
        body: JSON.stringify({
          platform,
          username: username.trim().replace(/^@/, ""),
          method: "bio_token",
        }),
      });
      setChallenge(res);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not initiate ownership verification.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmChallenge() {
    if (!challenge) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetchApi<{ appellant_session_token: string }>("/appeals/verify/confirm", {
        method: "POST",
        body: JSON.stringify({
          challenge_id: challenge.challenge_id,
          verification_token: challenge.verification_token,
        }),
      });
      setSessionToken(res.appellant_session_token);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ownership verification failed.");
    } finally {
      setLoading(false);
    }
  }

  async function submitAppeal(e: React.FormEvent) {
    e.preventDefault();
    if (!challenge || !sessionToken) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetchApi<AppealConfirmation>("/appeals", {
        method: "POST",
        headers: { "X-Appellant-Session": sessionToken },
        body: JSON.stringify({
          platform,
          username: challenge.account_username,
          statement: statement.trim(),
          supporting_urls: [],
        }),
      });
      setConfirmation(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Appeal submission failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <p className="caption-3 font-mono uppercase text-[#ff6600] mb-2">
        Independent reputation protection
      </p>
      <h1 className="heading-2 text-white">Free independent account appeal</h1>
      <p className="body-3 mt-3 text-zinc-400">
        Appeals are always free and never require swearing off AI writing assistance or making
        public oaths. Every appeal routes to an independent reviewer excluded from the original
        listing, with 48 hour triage and a 7 business day resolution target.
      </p>

      <div className="mt-6 rounded-xl border border-[#272727] bg-[#181818] p-4 caption-4 text-zinc-400">
        Scope notice: AIBlockList appeals govern AIBlockList and subscribing third party tools only.
        They do not reverse native platform suspensions or restore platform monetization.
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-[#ff6600]/40 bg-[#131209] p-4 flex items-start gap-2.5">
          <WarningCircle size={18} weight="bold" className="text-[#ff6600] shrink-0 mt-0.5" />
          <p className="body-6 text-zinc-200">{error}</p>
        </div>
      )}

      {confirmation ? (
        <div className="mt-8 rounded-2xl border border-[#272727] bg-[#181818] p-6 space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle size={22} weight="bold" className="text-[#ff6600] shrink-0 mt-0.5" />
            <div>
              <h2 className="title-2 text-white">Appeal recorded and acknowledged</h2>
              <p className="body-6 mt-1 text-zinc-400">{confirmation.scope_notice}</p>
            </div>
          </div>
          <div className="rounded-xl border border-[#272727] bg-[#000000] p-4 font-mono caption-4 space-y-1.5 text-zinc-300">
            <p>Appeal ID: {confirmation.appeal_id}</p>
            <p>Status: {confirmation.status}</p>
            <p>48h procedural triage target: {confirmation.triage_target_date.slice(0, 10)}</p>
            <p>Independent review target: {confirmation.sla_target_date.slice(0, 10)}</p>
          </div>
        </div>
      ) : step === 1 ? (
        <form
          onSubmit={startChallenge}
          className="mt-8 rounded-2xl border border-[#272727] bg-[#181818] p-6 space-y-4"
        >
          <div className="flex items-center gap-2 text-zinc-300">
            <Key size={18} weight="bold" className="text-[#ff6600]" />
            <h2 className="title-3 text-white">Step 1: Verify account control</h2>
          </div>
          <div>
            <label className="title-4 block text-white mb-2">Platform</label>
            <div className="flex items-center gap-2">
              {(["x", "threads"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={`caption-3 rounded-lg px-4 py-2 font-mono uppercase transition-colors duration-300 ${
                    platform === p
                      ? "bg-[#ff6600] text-black font-bold"
                      : "border border-[#272727] bg-[#000000] text-zinc-400 hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="appeal-handle" className="title-4 block text-white mb-2">
              Indexed {platform === "x" ? "X" : "Threads"} handle
            </label>
            <input
              id="appeal-handle"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={platform === "x" ? "Cocothe_gb" : "threads_growth_spammer"}
              className="body-5 w-full rounded-lg border border-[#272727] bg-[#000000] px-3 py-2 font-mono text-white placeholder:text-zinc-500 focus:border-[#ff6600] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="button-md rounded-lg bg-[#ff6600] px-4 py-2 text-black hover:bg-[#e55c00] disabled:opacity-50 transition-colors duration-300"
          >
            {loading ? "Generating challenge..." : "Generate ownership challenge"}
          </button>
        </form>
      ) : step === 2 && challenge ? (
        <div className="mt-8 rounded-2xl border border-[#272727] bg-[#181818] p-6 space-y-4">
          <h2 className="title-3 text-white">
            Step 2: Publish single use bio token for @{challenge.account_username}
          </h2>
          <p className="body-6 text-zinc-400">{challenge.instructions}</p>
          <div className="rounded-xl border border-[#ff6600]/40 bg-[#000000] p-4 font-mono title-3 text-[#ff6600] select-all">
            {challenge.verification_token}
          </div>
          <p className="caption-5 font-mono text-zinc-500">
            Bound to platform ID {challenge.platform_account_id || "handle"} · Expires{" "}
            {challenge.expires_at}
          </p>
          <button
            type="button"
            disabled={loading}
            onClick={confirmChallenge}
            className="button-md rounded-lg bg-[#ff6600] px-4 py-2 text-black hover:bg-[#e55c00] disabled:opacity-50 transition-colors duration-300"
          >
            {loading ? "Verifying token..." : "Confirm ownership token"}
          </button>
        </div>
      ) : (
        <form
          onSubmit={submitAppeal}
          className="mt-8 rounded-2xl border border-[#272727] bg-[#181818] p-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Scales size={18} weight="bold" className="text-[#ff6600]" />
            <h2 className="title-3 text-white">
              Step 3: Submit statement for @{challenge?.account_username}
            </h2>
          </div>
          <div>
            <label htmlFor="appeal-statement" className="title-4 block text-white mb-2">
              Counter evidence or remediation statement (minimum 20 characters)
            </label>
            <textarea
              id="appeal-statement"
              required
              minLength={20}
              maxLength={3000}
              rows={5}
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="Explain why the behavioral signals do not apply, identify any mistaken handle ownership, or confirm 30 consecutive days without automated reply spam."
              className="body-5 w-full rounded-lg border border-[#272727] bg-[#000000] px-3 py-2 text-white placeholder:text-zinc-500 focus:border-[#ff6600] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="button-md rounded-lg bg-[#ff6600] px-4 py-2 text-black hover:bg-[#e55c00] disabled:opacity-50 transition-colors duration-300"
          >
            {loading ? "Submitting appeal..." : "Submit independent appeal"}
          </button>
        </form>
      )}
    </section>
  );
}
