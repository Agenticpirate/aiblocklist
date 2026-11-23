// AIBlockList Background Service Worker - Local-First Cache Synchronizer

const DEFAULT_API = "https://aiblocklist.com/api/v1";
const LOCAL_API = "http://127.0.0.1:8000/api/v1";

async function getApiBase() {
  const cfg = await chrome.storage.local.get(["api_base"]);
  return cfg.api_base || LOCAL_API;
}

async function syncBlocklist() {
  try {
    const base = await getApiBase();
    const res = await fetch(`${base}/blocklists/export?format=json`);
    if (!res.ok) return;
    const accounts = await res.json();
    
    // Store indexed handles in a fast lookup map: platform:handle -> record
    const lookup = {};
    for (const a of accounts) {
      const key = `${a.platform}:${a.username.toLowerCase()}`;
      lookup[key] = {
        classification: a.classification,
        verification_status: a.verification_status,
        url: a.public_profile_url
      };
    }

    await chrome.storage.local.set({
      indexed_accounts: lookup,
      account_count: Object.keys(lookup).length,
      last_sync_at: new Date().toISOString()
    });
    console.log(`[AIBlockList] Synced ${Object.keys(lookup).length} accounts.`);
  } catch (err) {
    console.warn("[AIBlockList] Sync failed:", err);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  // Set default settings
  chrome.storage.local.set({
    filter_mode: "warn", // "warn" | "dim" | "highlight"
    enabled: true
  });
  syncBlocklist();
  // Schedule sync every 6 hours
  chrome.alarms.create("sync_blocklist", { periodInMinutes: 360 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "sync_blocklist") {
    syncBlocklist();
  }
});

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.type === "CHECK_ACCOUNT") {
    chrome.storage.local.get(["indexed_accounts", "filter_mode", "enabled"], (data) => {
      if (!data.enabled) {
        sendResponse({ match: null });
        return;
      }
      const map = data.indexed_accounts || {};
      const key = `${req.platform}:${req.username.toLowerCase()}`;
      const record = map[key] || null;
      sendResponse({ match: record, mode: data.filter_mode || "warn" });
    });
    return true;
  }
  if (req.type === "FORCE_SYNC") {
    syncBlocklist().then(() => sendResponse({ ok: true }));
    return true;
  }
});
