const SITE_CONFIG = [
  {
    key: "chatgpt",
    label: "ChatGPT",
    hosts: ["chat.openai.com", "chatgpt.com"]
  },
  {
    key: "gemini",
    label: "Gemini",
    hosts: ["gemini.google.com"]
  },
  {
    key: "claude",
    label: "Claude",
    hosts: ["claude.ai"],
    hostSuffixes: [".claude.ai"]
  }
];

const storage = chrome.storage?.sync ?? chrome.storage.local;

const getStorageKey = (siteKey) => `widemodeEnabled:${siteKey}`;

const getDefaults = () =>
  SITE_CONFIG.reduce((acc, site) => {
    acc[getStorageKey(site.key)] = true;
    return acc;
  }, {});

const getActiveTabHost = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) {
    return null;
  }
  try {
    return new URL(tab.url).hostname;
  } catch (error) {
    return null;
  }
};

const getSiteKeyForHost = (hostname) => {
  if (!hostname) {
    return null;
  }
  const exactMatch = SITE_CONFIG.find((site) => site.hosts?.includes(hostname));
  if (exactMatch) {
    return exactMatch.key;
  }
  const suffixMatch = SITE_CONFIG.find((site) =>
    site.hostSuffixes?.some((suffix) => hostname.endsWith(suffix))
  );
  return suffixMatch?.key ?? null;
};

const renderToggle = ({ key, label }) => {
  const wrapper = document.createElement("div");
  wrapper.className = "toggle";

  const text = document.createElement("span");
  text.textContent = label;

  const switchLabel = document.createElement("label");
  switchLabel.className = "switch";

  const input = document.createElement("input");
  input.type = "checkbox";
  input.dataset.siteKey = key;

  const slider = document.createElement("span");
  slider.className = "slider";

  switchLabel.append(input, slider);
  wrapper.append(text, switchLabel);
  return { wrapper, input };
};

const sendToggleMessage = async (siteKey, enabled) => {
  const activeHost = await getActiveTabHost();
  const activeSiteKey = getSiteKeyForHost(activeHost);
  if (activeSiteKey !== siteKey) {
    return;
  }
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    return;
  }
  chrome.tabs.sendMessage(tab.id, { type: "widemode:set", enabled });
};

const init = async () => {
  const container = document.getElementById("toggles");
  if (!container) {
    return;
  }

  const defaults = getDefaults();
  const stored = await storage.get(defaults);

  SITE_CONFIG.forEach((site) => {
    const { wrapper, input } = renderToggle(site);
    const storageKey = getStorageKey(site.key);
    input.checked = Boolean(stored[storageKey]);
    input.addEventListener("change", async (event) => {
      const enabled = event.target.checked;
      await storage.set({ [storageKey]: enabled });
      await sendToggleMessage(site.key, enabled);
    });
    container.appendChild(wrapper);
  });
};

document.addEventListener("DOMContentLoaded", init);
