(() => {
  const STYLE_ID = "widemode-ai-style";

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

  const applyStyle = () => {
    if (document.getElementById(STYLE_ID)) {
      return;
    }
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = rules;
    document.head.appendChild(style);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyStyle, { once: true });
  } else {
    applyStyle();
  }
})();
