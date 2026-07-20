export type AnalyticsConsent = "granted" | "denied" | null;

export const ANALYTICS_CONSENT_EVENT = "analytics-consent-change";

const STORAGE_KEY = "kirillarz.analyticsConsent";

export function getAnalyticsConsent(): AnalyticsConsent {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function setAnalyticsConsent(consent: Exclude<AnalyticsConsent, null>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, consent);
  } catch {
    // The current choice still applies for this page even if storage is unavailable.
  }

  window.dispatchEvent(
    new CustomEvent<Exclude<AnalyticsConsent, null>>(ANALYTICS_CONSENT_EVENT, {
      detail: consent,
    }),
  );
}
