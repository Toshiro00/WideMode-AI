(() => {
  const STYLE_ID = "widemode-ai-style";
  const storage = chrome.storage?.sync ?? chrome.storage.local;

  const SITE_CONFIG = [
    { key: "chatgpt", hosts: ["chat.openai.com", "chatgpt.com"] },
    { key: "gemini", hosts: ["gemini.google.com"] },
    { key: "claude", hosts: ["claude.ai"], hostSuffixes: [".claude.ai"] }
  ];

  const rules = [
    /* ===== Config ===== */
    ":root { --widemode-max-width: 1200px; }",

    /* ===== Make the app container not fight us ===== */
    "main, main > div { max-width: 100% !important; }",

    /* =========================================================
       CHAT / CONTENT WIDE (messages area)
       Keep normal content at widemode width
       ========================================================= */
    "main :is(.mx-auto, [class*='max-w-'], .prose, article) { max-width: var(--widemode-max-width) !important; width: 100% !important; margin-inline: auto !important; }",
    "main pre, main code { max-width: 100% !important; }",

    /* =========================================================
       COMPOSER FIX (input area)
       Unclamp ONLY the composer region so it can be full width
       ========================================================= */

    /* 1) Form itself full width */
    "[data-widemode-site='chatgpt'] form[data-type='unified-composer'] { width: 100% !important; max-width: 100% !important; }",
    "[data-widemode-site='chatgpt'] form[data-type='unified-composer'] > div { width: 100% !important; max-width: 100% !important; }",

    /* 2) Inside composer: remove any max-w/mx-auto clamps */
    "[data-widemode-site='chatgpt'] form[data-type='unified-composer'] :is(.mx-auto, [class*='max-w-']) { max-width: 100% !important; width: 100% !important; margin-inline: 0 !important; }",

    /* 3) NEW CHAT (landing) special case:
          Only unclamp wrappers that actually CONTAIN the composer (not the whole main) */
    "[data-widemode-site='chatgpt'] :is(main, body) :is(.mx-auto, [class*='max-w-']):has( form[data-type='unified-composer'] ) { max-width: 100% !important; width: 100% !important; }",

    /* 4) Prevent flex shrink so the editor expands */
    "[data-widemode-site='chatgpt'] form[data-type='unified-composer'] * { min-width: 0 !important; }",
    "[data-widemode-site='chatgpt'] form[data-type='unified-composer'] .ProseMirror { width: 100% !important; }",
    "[data-widemode-site='chatgpt'] [data-message-author-role='user'] {  display: flex!important;  justify - content: flex - end!important;}",
    "[data-widemode-site='chatgpt'] [data-message-author-role='user'] > div {  max-width: 70% !important; /* adjust to taste */  margin-left: auto !important;}",
    "[data-widemode-site='chatgpt'] [data-message-author-role='assistant'] {  justify-content: center !important;}",


    /* =========================================================
   GEMINI
   ========================================================= */
    "[data-widemode-site='gemini'] html, [data-widemode-site='gemini'] body { width: 100% !important; margin: 0 !important; padding: 0 !important; }",
    "[data-widemode-site='gemini'] main, [data-widemode-site='gemini'] main > div { width: 100% !important; max-width: 100% !important; margin-inline: auto !important; }",
    "[data-widemode-site='gemini'] .chat-window, [data-widemode-site='gemini'] .conversation-container { max-width: var(--widemode-max-width) !important; width: 100% !important; margin-inline: auto !important; }",
    "[data-widemode-site='gemini'] :is(.mx-auto, [class*='max-w-'], .prose, article) { max-width: var(--widemode-max-width) !important; width: 100% !important; margin-inline: auto !important; }",

    /* =========================================================
       CLAUDE
       ========================================================= */
    "[data-widemode-site='claude'] #root, [data-widemode-site='claude'] #root > div, [data-widemode-site='claude'] main { max-width: 100% !important; width: 100% !important; margin-inline: auto !important; }",
    "[data-widemode-site='claude'] .max-w-2xl, [data-widemode-site='claude'] .max-w-3xl, [data-widemode-site='claude'] .max-w-4xl { max-width: var(--widemode-max-width) !important; width: 100% !important; margin-inline: auto !important; }",
    "[data-widemode-site='claude'] .prose, [data-widemode-site='claude'] article { max-width: var(--widemode-max-width) !important; width: 100% !important; margin-inline: auto !important; }",
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
