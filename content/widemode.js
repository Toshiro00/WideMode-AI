(() => {
  const STYLE_ID = "widemode-ai-style";
  const storage = chrome.storage?.sync ?? chrome.storage.local;

  const SITE_CONFIG = [
    { key: "chatgpt", hosts: ["chat.openai.com", "chatgpt.com"] },
    { key: "gemini", hosts: ["gemini.google.com"] },
    { key: "claude", hosts: ["claude.ai"], hostSuffixes: [".claude.ai"] }
  ];

  const rules = [
    "body { --widemode-max-width: 1200px; }",
    "main, main > div { max-width: 100% !important; }",
    "main .mx-auto { max-width: var(--widemode-max-width) !important; width: 100% !important; }",
    "main .max-w-2xl, main .max-w-3xl, main .max-w-4xl, main .max-w-5xl, main .max-w-6xl { max-width: var(--widemode-max-width) !important; }",
    "main .xl\\:max-w-3xl, main .xl\\:max-w-4xl, main .xl\\:max-w-5xl { max-width: var(--widemode-max-width) !important; }",
    "main .prose { max-width: var(--widemode-max-width) !important; }",
    "main .chat-history, main .conversation, main .chat-window { max-width: var(--widemode-max-width) !important; width: 100% !important; }",
    "main .message, main .message-content, main .chat-message { max-width: var(--widemode-max-width) !important; width: 100% !important; }",
    "main pre, main code { max-width: 100% !important; }",
    "article { max-width: var(--widemode-max-width) !important; width: 100% !important; }"
  ].join("\n");

  const getStorageKey = (siteKey) => `widemodeEnabled:${siteKey}`;

  const getSiteKeyForHost = (hostname) => {
    const exactMatch = SITE_CONFIG.find((site) => site.hosts?.includes(hostname));
    if (exactMatch) {
      return exactMatch.key;
    }
    const suffixMatch = SITE_CONFIG.find((site) =>
      site.hostSuffixes?.some((suffix) => hostname.endsWith(suffix))
    );
    return suffixMatch?.key ?? null;
  };

  const applyStyle = () => {
    if (document.getElementById(STYLE_ID)) {
      return;
    }
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = rules;
    document.head.appendChild(style);
  };

  const removeStyle = () => {
    const style = document.getElementById(STYLE_ID);
    if (style) {
      style.remove();
    }
  };

  const applyForCurrentSite = async () => {
    const siteKey = getSiteKeyForHost(window.location.hostname);
    if (!siteKey) {
      return;
    }
    const storageKey = getStorageKey(siteKey);
    const stored = await storage.get({ [storageKey]: true });
    if (stored[storageKey]) {
      applyStyle();
    } else {
      removeStyle();
    }
  };

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type !== "widemode:set") {
      return;
    }
    if (message.enabled) {
      applyStyle();
    } else {
      removeStyle();
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyForCurrentSite, {
      once: true
    });
  } else {
    applyForCurrentSite();
  }
})();
