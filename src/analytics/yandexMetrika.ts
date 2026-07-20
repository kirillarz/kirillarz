const COUNTER_ID = 110893186;
const SCRIPT_URL = `https://mc.yandex.ru/metrika/tag.js?id=${COUNTER_ID}`;

type YandexMetrika = (
  counterId: number,
  method: string,
  ...parameters: unknown[]
) => void;

type QueuedYandexMetrika = YandexMetrika & {
  a?: unknown[][];
  l?: number;
};

declare global {
  interface Window {
    ym?: YandexMetrika;
  }
}

let initialized = false;
let lastTrackedUrl: string | undefined;
let previousUrl: string | undefined;

export function initializeYandexMetrika() {
  if (!import.meta.env.PROD || initialized) return;

  if (!window.ym) {
    const queuedYm: QueuedYandexMetrika = (...args: unknown[]) => {
      (queuedYm.a ??= []).push(args);
    };

    queuedYm.l = Date.now();
    window.ym = queuedYm;
  }

  if (!document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_URL}"]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.src = SCRIPT_URL;
    document.head.append(script);
  }

  window.ym(COUNTER_ID, "init", {
    ssr: true,
    defer: true,
    webvisor: true,
    clickmap: true,
    accurateTrackBounce: true,
    trackLinks: true,
  });

  initialized = true;
}

export function trackCurrentPage() {
  if (!import.meta.env.PROD || !window.ym) return;

  const currentUrl =
    window.location.origin + window.location.pathname + window.location.search;

  if (currentUrl === lastTrackedUrl) return;

  window.ym(COUNTER_ID, "hit", currentUrl, {
    title: document.title,
    referer: previousUrl ?? document.referrer,
  });

  previousUrl = currentUrl;
  lastTrackedUrl = currentUrl;
}

export function disableYandexMetrika() {
  if (initialized && window.ym) {
    window.ym(COUNTER_ID, "destruct");
  }

  initialized = false;
  lastTrackedUrl = undefined;
  previousUrl = undefined;
}

export function reachMetrikaGoal(
  goal: string,
  parameters?: Record<string, unknown>,
) {
  if (!import.meta.env.PROD || !window.ym) return;

  window.ym(COUNTER_ID, "reachGoal", goal, parameters);
}
