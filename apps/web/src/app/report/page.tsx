"use client";

import { useState } from "react";
import { CheckCircle, WarningCircle, Plus, Trash } from "@phosphor-icons/react";
import { fetchApi } from "@/lib/api";

interface ReportResult {
  report_id: string;
  status: string;
  status_token: string;
  status_url: string;
  notice: string;
}

export default function ReportPage() {
  const [accountUrl, setAccountUrl] = useState("");
  const [reasonCode, setReasonCode] = useState("repetitive_engagement_farming");
  const [urls, setUrls] = useState<string[]>(["", ""]);
  const [explanation, setExplanation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReportResult | null>(null);

  function updateUrl(index: number, value: string) {
    setUrls((prev) => prev.map((u, i) => (i === index ? value : u)));
  }

  function addUrlField() {
    if (urls.length < 10) setUrls((prev) => [...prev, ""]);
  }

  function removeUrlField(index: number) {
    if (urls.length > 1) setUrls((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const cleanedUrls = urls.map((u) => u.trim()).filter(Boolean);
    if (!accountUrl.trim().startsWith("https://x.com/")) {
      setError("Enter a canonical https://x.com/handle profile URL.");
      return;
    }
    if (cleanedUrls.length === 0) {
      setError("Attach at least one canonical public X post or reply URL.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetchApi<ReportResult>("/reports", {
        method: "POST",
        body: JSON.stringify({
          platform: "x",
          account_url: accountUrl.trim(),
          evidence_urls: cleanedUrls,
          reason_code: reasonCode,
          explanation: explanation.trim() || null,
        }),
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Report submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <p className="caption-3 font-mono uppercase text-[#ff6600] mb-2">
        Protected community intake
      </p>
      <h1 className="heading-2 text-white">Submit behavioral evidence</h1>
      <p className="body-3 mt-3 text-zinc-400">
        Community reports never trigger automatic public classification. Every submission enters
        24 hour deduplication, anti brigading checks, and human review. Screenshots and arbitrary
        file uploads are rejected to protect privacy.
      </p>

      {result ? (
        <div className="mt-8 rounded-2xl border border-[#272727] bg-[#181818] p-6 space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle size={22} weight="bold" className="text-[#ff6600] shrink-0 mt-0.5" />
            <div>
              <h2 className="title-2 text-white">Report queued for triage</h2>
              <p className="body-6 mt-1 text-zinc-400">{result.notice}</p>
            </div>
          </div>
          <div className="rounded-xl border border-[#272727] bg-[#000000] p-4 font-mono caption-4 space-y-1.5 text-zinc-300">
            <p>Report ID: {result.report_id}</p>
            <p>Status: {result.status}</p>
            <p className="break-all">Tracking token: {result.status_token}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setResult(null);
              setAccountUrl("");
              setUrls(["", ""]);
              setExplanation("");
            }}
            className="button-sm rounded-lg border border-[#313131] bg-[#1f1f1f] px-3 py-2 text-white hover:bg-[#272727]"
          >
            Submit another report
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border border-[#272727] bg-[#181818] p-6 space-y-5"
        >
          {error && (
            <div className="rounded-xl border border-[#ff6600]/40 bg-[#131209] p-4 flex items-start gap-2.5">
              <WarningCircle size={18} weight="bold" className="text-[#ff6600] shrink-0 mt-0.5" />
              <p className="body-6 text-zinc-200">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="account-url" className="title-4 block text-white mb-2">
              Target X profile URL
            </label>
            <input
              id="account-url"
              type="url"
              required
              value={accountUrl}
              onChange={(e) => setAccountUrl(e.target.value)}
              placeholder="https://x.com/example_handle"
              className="body-5 w-full rounded-lg border border-[#272727] bg-[#000000] px-3 py-2 font-mono text-white placeholder:text-zinc-500 focus:border-[#ff6600] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="reason-code" className="title-4 block text-white mb-2">
              Observable behavioral pattern
            </label>
            <select
              id="reason-code"
              value={reasonCode}
              onChange={(e) => setReasonCode(e.target.value)}
              className="body-5 w-full rounded-lg border border-[#272727] bg-[#000000] px-3 py-2 text-white focus:border-[#ff6600] focus:outline-none"
            >
              <option value="repetitive_engagement_farming">
                Repetitive engagement farming (formulaic reply loops)
              </option>
              <option value="confirmed_automated_spam">
                Automated spam (near duplicate unsolicited replies)
              </option>
              <option value="coordinated_manipulation">
                Coordinated manipulation (3 or more synchronized accounts)
              </option>
              <option value="impersonation_automation">
                Impersonation and deceptive automation
              </option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="title-4 text-white">
                Public post or reply URLs (1 to 10; minimum 2 needed for confirmation)
              </label>
              {urls.length < 10 && (
                <button
                  type="button"
                  onClick={addUrlField}
                  className="button-xsm inline-flex items-center gap-1 rounded-md border border-[#313131] bg-[#1f1f1f] px-2 py-1 text-zinc-200 hover:bg-[#272727]"
                >
                  <Plus size={12} weight="bold" />
                  <span>Add URL</span>
                </button>
              )}
            </div>
            <div className="space-y-2">
              {urls.map((u, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="url"
                    value={u}
                    onChange={(e) => updateUrl(idx, e.target.value)}
                    placeholder={`https://x.com/handle/status/199100000${idx + 1}`}
                    className="body-5 flex-1 rounded-lg border border-[#272727] bg-[#000000] px-3 py-2 font-mono text-white placeholder:text-zinc-500 focus:border-[#ff6600] focus:outline-none"
                  />
                  {urls.length > 1 && (
                    <button
                      type="button"
                      aria-label="Remove URL"
                      onClick={() => removeUrlField(idx)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#272727] bg-[#1f1f1f] text-zinc-400 hover:text-white"
                    >
                      <Trash size={16} weight="bold" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="explanation" className="title-4 text-white">
                Optional behavioral context (never include private PII)
              </label>
              <span className="caption-5 font-mono text-zinc-500">{explanation.length}/1000</span>
            </div>
            <textarea
              id="explanation"
              maxLength={1000}
              rows={4}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Describe the observable repetitive pattern or coordinated links. Do not submit personal disputes or private contact details."
              className="body-5 w-full rounded-lg border border-[#272727] bg-[#000000] px-3 py-2 text-white placeholder:text-zinc-500 focus:border-[#ff6600] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="button-md inline-flex items-center justify-center rounded-lg bg-[#ff6600] px-4 py-2 text-black hover:bg-[#e55c00] active:scale-[0.98] disabled:opacity-50 transition-all duration-300"
          >
            {submitting ? "Submitting report..." : "Queue report for review"}
          </button>
        </form>
      )}
    </section>
  );
}
