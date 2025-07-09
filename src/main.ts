import createApp from "./lib";

const WEBFLOW_SITE_URL = import.meta.env.WEBFLOW_SITE_URL;

const isWebflowPreviewEnv =
  new URL(WEBFLOW_SITE_URL).hostname.startsWith("preview") &&
  new URL(WEBFLOW_SITE_URL).pathname.startsWith("/preview");

let _document: Document | undefined;

if (isWebflowPreviewEnv) {
  const mutationObserverConfig = { childList: true, subtree: true };
  const bootstrapIframe = (
    mutationList: MutationRecord[],
    observer: MutationObserver,
  ) => {
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        const iframe = Array.from(document.querySelectorAll("iframe")).find(
          (i) => i.id === "site-iframe-next",
        );
        if (
          !_document &&
          iframe?.contentDocument &&
          window.self === window.top
        ) {
          _document = iframe.contentDocument;
          _document.addEventListener("readystatechange", () => {
            console.log(_document?.readyState);
            if (_document?.readyState === "complete") {
              console.log("Inital bootstrap intentially delayed by 1s");
              setTimeout(() => _document && init(_document), 1000);
            }
          });
        }
      }
      if (_document) {
        observer.disconnect();
      }
    }
  };
  const observer = new MutationObserver(bootstrapIframe);
  observer.observe(document, mutationObserverConfig);
} else {
  _document = document;
  init(_document);
}

export function init(injectedDocument: Document) {
  createApp(injectedDocument);
}

// Support Vite HMR
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    if (newModule) {
      console.log("HMR update applied");
      const iframe = Array.from(document.querySelectorAll("iframe")).find(
        (i) => i.id === "site-iframe-next",
      );
      if (iframe?.contentDocument) {
        _document = iframe.contentDocument;
        newModule.init(_document);
      }
    }
  });
}
