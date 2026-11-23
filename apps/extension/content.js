// AIBlockList In-Page Content Script - Runs on X and Threads feeds
// Strictly complies with platform safety: Zero DOM auto-clicking, zero automated mass blocks.

const PROCESSED_ATTR = "data-aibl-checked";

function getPlatform() {
  const host = window.location.hostname;
  if (host.includes("threads.net")) return "threads";
  return "x";
}

function processHandleLinks() {
  const platform = getPlatform();
  // Select user handle links on X / Threads
  let links = [];
  if (platform === "x") {
    links = document.querySelectorAll(`a[href^="/"][role="link"]:not([${PROCESSED_ATTR}])`);
  } else {
    links = document.querySelectorAll(`a[href*="/@"]:not([${PROCESSED_ATTR}])`);
  }

  links.forEach((link) => {
    link.setAttribute(PROCESSED_ATTR, "true");
    const href = link.getAttribute("href") || "";
    let handle = "";

    if (platform === "x") {
      const match = href.match(/^\/([A-Za-z0-9_]{1,15})(?:\/|\?|$)/);
      if (match && !["home", "explore", "notifications", "messages", "search", "settings"].includes(match[1].toLowerCase())) {
        handle = match[1];
      }
    } else {
      const match = href.match(/@([A-Za-z0-9_.-]{1,30})/);
      if (match) handle = match[1];
    }

    if (!handle) return;

    chrome.runtime.sendMessage(
      { type: "CHECK_ACCOUNT", platform, username: handle },
      (res) => {
        if (!res || !res.match) return;

        injectWarningBadge(link, handle, platform, res.match, res.mode);
      }
    );
  });
}

function injectWarningBadge(element, handle, platform, record, mode) {
  if (element.parentElement.querySelector(".aibl-badge")) return;

  const badge = document.createElement("span");
  badge.className = "aibl-badge";
  const isVerified = record.verification_status === "verified";
  badge.setAttribute("data-status", isVerified ? "verified" : "under_review");

  const label = isVerified ? "⚠ AI Spam" : "🔍 Under Review";
  badge.textContent = label;

  badge.title = `AIBlockList Dossier: @${handle} (${record.classification}). Click to view public evidence.`;

  badge.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(`https://aiblocklist.com/accounts/${platform}/${handle}`, "_blank");
  });

  element.insertAdjacentElement("afterend", badge);

  // Apply subtle visual styling based on user filter preference
  if (mode === "dim") {
    const postContainer = element.closest("article") || element.closest('[data-testid="tweet"]');
    if (postContainer) {
      postContainer.classList.add("aibl-dimmed-post");
    }
  } else if (mode === "highlight") {
    const postContainer = element.closest("article") || element.closest('[data-testid="tweet"]');
    if (postContainer) {
      postContainer.classList.add("aibl-highlighted-post");
    }
  }
}

// Observe feed updates dynamically
const observer = new MutationObserver(() => {
  processHandleLinks();
});

observer.observe(document.body, { childList: true, subtree: true });
setTimeout(processHandleLinks, 1000);
