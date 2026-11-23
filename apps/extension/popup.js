// AIBlockList Extension Popup Script

document.addEventListener("DOMContentLoaded", () => {
  const countEl = document.getElementById("account-count");
  const modeSelect = document.getElementById("mode-select");
  const syncBtn = document.getElementById("sync-btn");

  chrome.storage.local.get(["account_count", "filter_mode"], (data) => {
    if (data.account_count) {
      countEl.textContent = Number(data.account_count).toLocaleString();
    } else {
      countEl.textContent = "3,621";
    }
    if (data.filter_mode) {
      modeSelect.value = data.filter_mode;
    }
  });

  modeSelect.addEventListener("change", () => {
    chrome.storage.local.set({ filter_mode: modeSelect.value });
  });

  syncBtn.addEventListener("click", () => {
    syncBtn.textContent = "Syncing...";
    chrome.runtime.sendMessage({ type: "FORCE_SYNC" }, () => {
      chrome.storage.local.get(["account_count"], (data) => {
        if (data.account_count) {
          countEl.textContent = Number(data.account_count).toLocaleString();
        }
        syncBtn.textContent = "Synced ✓";
        setTimeout(() => (syncBtn.textContent = "Sync Now"), 2000);
      });
    });
  });
});
