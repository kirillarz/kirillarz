import { useEffect, useState } from "react";

import {
  ANALYTICS_CONSENT_EVENT,
  getAnalyticsConsent,
  setAnalyticsConsent,
  type AnalyticsConsent,
} from "./analyticsConsent";
import "./CookieConsent.css";

export function CookieConsent() {
  const [consent, setConsent] = useState<AnalyticsConsent>(getAnalyticsConsent);

  useEffect(() => {
    const handleConsentChange = (event: Event) => {
      setConsent((event as CustomEvent<Exclude<AnalyticsConsent, null>>).detail);
    };

    window.addEventListener(ANALYTICS_CONSENT_EVENT, handleConsentChange);
    return () => window.removeEventListener(ANALYTICS_CONSENT_EVENT, handleConsentChange);
  }, []);

  if (consent !== null) return null;

  return (
    <aside className="cookieConsent" aria-label="Настройки аналитических cookies">
      <div className="cookieConsentCopy">
        <strong>Аналитические cookies</strong>
        <p>
          С разрешения сайт использует Яндекс Метрику и Вебвизор, чтобы понимать посещаемость и улучшать интерфейс. {" "}
          <a href={`${import.meta.env.BASE_URL}privacy`}>Подробнее в политике</a>.
        </p>
      </div>
      <div className="cookieConsentActions">
        <button type="button" className="cookieConsentSecondary" onClick={() => setAnalyticsConsent("denied")}>
          Только необходимые
        </button>
        <button type="button" className="cookieConsentPrimary" onClick={() => setAnalyticsConsent("granted")}>
          Разрешить
        </button>
      </div>
    </aside>
  );
}
