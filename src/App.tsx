import { useEffect } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import {
  disableYandexMetrika,
  initializeYandexMetrika,
  trackCurrentPage,
} from "./analytics/yandexMetrika";
import { CookieConsent } from "./privacy/CookieConsent";
import {
  ANALYTICS_CONSENT_EVENT,
  getAnalyticsConsent,
  type AnalyticsConsent,
} from "./privacy/analyticsConsent";
import { routes } from "./routes";

const router = createBrowserRouter(routes, {
  basename: import.meta.env.BASE_URL,
});

export function App() {
  useEffect(() => {
    if (getAnalyticsConsent() === "granted") {
      initializeYandexMetrika();
    }

    let animationFrame = window.requestAnimationFrame(trackCurrentPage);

    const unsubscribe = router.subscribe(() => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(trackCurrentPage);
    });

    const handleConsentChange = (event: Event) => {
      const consent = (event as CustomEvent<Exclude<AnalyticsConsent, null>>).detail;

      window.cancelAnimationFrame(animationFrame);
      if (consent === "granted") {
        initializeYandexMetrika();
        animationFrame = window.requestAnimationFrame(trackCurrentPage);
      } else {
        disableYandexMetrika();
      }
    };

    window.addEventListener(ANALYTICS_CONSENT_EVENT, handleConsentChange);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      unsubscribe();
      window.removeEventListener(ANALYTICS_CONSENT_EVENT, handleConsentChange);
    };
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <CookieConsent />
    </>
  );
}
