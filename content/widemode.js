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
    "main, main > div { max-width: 100% !important; margin-inline: auto !important; }",
    "main .mx-auto { max-width: var(--widemode-max-width) !important; width: 100% !important; margin-inline: auto !important; }",
    "main .max-w-2xl, main .max-w-3xl, main .max-w-4xl, main .max-w-5xl, main .max-w-6xl { max-width: var(--widemode-max-width) !important; margin-inline: auto !important; width: 100% !important; }",
    "main .xl\\:max-w-3xl, main .xl\\:max-w-4xl, main .xl\\:max-w-5xl { max-width: var(--widemode-max-width) !important; margin-inline: auto !important; width: 100% !important; }",
    "main .prose { max-width: var(--widemode-max-width) !important; margin-inline: auto !important; width: 100% !important; }",
    "main .chat-history, main .conversation, main .chat-window { max-width: var(--widemode-max-width) !important; width: 100% !important; margin-inline: auto !important; }",
    "main .message, main .message-content, main .chat-message { max-width: var(--widemode-max-width) !important; width: 100% !important; margin-inline: auto !important; }",
    "main pre, main code { max-width: 100% !important; }",
    "article { max-width: var(--widemode-max-width) !important; width: 100% !important; margin-inline: auto !important; }",
    "[data-widemode-site='gemini'] html, [data-widemode-site='gemini'] body { width: 100% !important; margin: 0 !important; padding: 0 !important; }",
    "[data-widemode-site='gemini'] main, [data-widemode-site='gemini'] main > div { width: 100% !important; margin-inline: auto !important; }",
    "[data-widemode-site='gemini'] .chat-window, [data-widemode-site='gemini'] .conversation-container { max-width: var(--widemode-max-width) !important; width: 100% !important; margin-inline: auto !important; }",
    "[data-widemode-site='claude'] #root, [data-widemode-site='claude'] #root > div, [data-widemode-site='claude'] main { max-width: 100% !important; width: 100% !important; margin-inline: auto !important; }",
    "[data-widemode-site='claude'] .max-w-2xl, [data-widemode-site='claude'] .max-w-3xl, [data-widemode-site='claude'] .max-w-4xl { max-width: var(--widemode-max-width) !important; width: 100% !important; margin-inline: auto !important; }",
    "[data-widemode-site='claude'] .prose { max-width: var(--widemode-max-width) !important; width: 100% !important; margin-inline: auto !important; }"
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

  const setSiteAttribute = (enabled) => {
    const siteKey = getSiteKeyForHost(window.location.hostname);
    if (!siteKey) {
      return;
    }
    if (enabled) {
      document.documentElement.dataset.widemodeSite = siteKey;
    } else if (document.documentElement.dataset.widemodeSite === siteKey) {
      delete document.documentElement.dataset.widemodeSite;
    }
  };

  const applyStyle = () => {
    if (document.getElementById(STYLE_ID)) {
      setSiteAttribute(true);
      return;
    }
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = rules;
    document.head.appendChild(style);
    setSiteAttribute(true);
  };

  const removeStyle = () => {
    const style = document.getElementById(STYLE_ID);
    if (style) {
      style.remove();
    }
    setSiteAttribute(false);
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
