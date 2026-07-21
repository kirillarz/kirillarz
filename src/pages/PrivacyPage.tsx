import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  ANALYTICS_CONSENT_EVENT,
  getAnalyticsConsent,
  setAnalyticsConsent,
  type AnalyticsConsent,
} from "../privacy/analyticsConsent";
import "./styles/Privacy.css";

function consentLabel(consent: AnalyticsConsent) {
  if (consent === "granted") return "аналитика разрешена";
  if (consent === "denied") return "аналитика отключена";
  return "решение ещё не принято";
}

export function PrivacyPage() {
  const [consent, setConsent] = useState<AnalyticsConsent>(getAnalyticsConsent);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Политика конфиденциальности — Кирилл Арзамасцев";

    const handleConsentChange = (event: Event) => {
      setConsent((event as CustomEvent<Exclude<AnalyticsConsent, null>>).detail);
    };

    window.addEventListener(ANALYTICS_CONSENT_EVENT, handleConsentChange);
    return () => {
      document.title = previousTitle;
      window.removeEventListener(ANALYTICS_CONSENT_EVENT, handleConsentChange);
    };
  }, []);

  return (
    <main className="privacyPage">
      <article className="privacyCard" aria-labelledby="privacy-title">
        <Link className="privacyBackLink" to="/">
          <span aria-hidden="true">←</span> На главную
        </Link>

        <header className="privacyIntro">
          <p className="privacyEyebrow">КОНФИДЕНЦИАЛЬНОСТЬ</p>
          <h1 id="privacy-title">Политика конфиденциальности</h1>
          <p>
            Эта политика объясняет, какие технические данные обрабатываются при посещении сайта {" "}
            <a href="https://kirillarz.ru/">kirillarz.ru</a> и как посетитель может управлять аналитикой.
          </p>
          <p className="privacyUpdated">
            Дата последнего обновления: <time dateTime="2026-07-21">21 июля 2026 года</time>.
          </p>
        </header>

        <div className="privacyContent">
          <section>
            <h2>1. Кто отвечает за сайт</h2>
            <p>
              Владелец сайта — Кирилл Арзамасцев. По вопросам конфиденциальности можно написать в Telegram: {" "}
              <a href="https://t.me/kirillarz" target="_blank" rel="noreferrer">@kirillarz</a>.
            </p>
          </section>

          <section>
            <h2>2. Какие данные обрабатываются</h2>
            <p>
              На сайте нет регистрации и форм, в которых посетителю предлагается указать имя, email или телефон.
              Если посетитель разрешает аналитику, Яндекс Метрика может автоматически получить:
            </p>
            <ul>
              <li>адрес открытой страницы, источник перехода, дату и время визита;</li>
              <li>IP-адрес с включённым в настройках Метрики маскированием;</li>
              <li>тип устройства, браузер, операционную систему, язык и параметры экрана;</li>
              <li>анонимные идентификаторы, сохраняемые в cookies и localStorage;</li>
              <li>сведения о кликах, переходах, глубине просмотра и времени на сайте;</li>
              <li>запись взаимодействия со страницей с помощью Вебвизора.</li>
            </ul>
          </section>

          <section>
            <h2>3. Зачем нужна аналитика</h2>
            <p>Данные используются, чтобы:</p>
            <ul>
              <li>оценивать посещаемость страниц и источники переходов;</li>
              <li>понимать, какие разделы и проекты интересны посетителям;</li>
              <li>находить проблемы навигации и улучшать интерфейс сайта.</li>
            </ul>
            <p>Данные не используются на сайте для принятия автоматизированных решений о посетителях.</p>
          </section>

          <section>
            <h2>4. Яндекс Метрика и Вебвизор</h2>
            <p>
              Сайт использует счётчик Яндекс Метрики № 110893186, предоставляемый ООО «ЯНДЕКС»
              (119021, Россия, Москва, ул. Льва Толстого, д. 16). После согласия данные автоматически
              передаются Яндексу и обрабатываются по его {" "}
              <a href="https://yandex.ru/legal/confidential/ru/" target="_blank" rel="noreferrer">
                Политике конфиденциальности
              </a>{" "}
              и {" "}
              <a href="https://yandex.ru/legal/metrica_termsofuse/ru/" target="_blank" rel="noreferrer">
                Условиям использования Метрики
              </a>.
            </p>
            <p>
              Вебвизор помогает воспроизводить взаимодействие с интерфейсом. На сайте отключена запись
              содержимого полей; передавать через цели или параметры Метрики персональные данные не планируется.
            </p>
          </section>

          <section>
            <h2>5. Cookies, localStorage и сроки хранения</h2>
            <p>
              До разрешения аналитики код Метрики не загружается. Выбор посетителя сохраняется в localStorage
              под техническим ключом <code>kirillarz.analyticsConsent</code>. Он хранится до изменения выбора
              или очистки данных сайта в браузере.
            </p>
            <p>
              Чтобы обязательная hero-анимация показывалась только при первом посещении, сайт сохраняет в
              localStorage технический ключ <code>hero-intro:completed:v1</code>. Он не содержит персональных
              данных и хранится до очистки данных сайта или смены версии анимации. При ошибке загрузки видео
              временный ключ <code>hero-intro:unavailable:v1</code> хранится только до закрытия браузерной сессии.
            </p>
            <p>
              После разрешения Яндекс может установить собственные cookies. Их назначение и сроки перечислены в {" "}
              <a href="https://yandex.ru/support/metrica/ru/general/cookie-usage" target="_blank" rel="noreferrer">
                справке Яндекс Метрики
              </a>. Срок хранения уже переданных данных определяется документами и настройками Яндекса.
            </p>
          </section>

          <section>
            <h2>6. Согласие и его отзыв</h2>
            <p>
              Основанием для включения аналитики является выбор посетителя в уведомлении. Отказ не ограничивает
              доступ к сайту. Изменить решение можно ниже в любое время.
            </p>
            <div className="privacyConsentPanel">
              <p aria-live="polite">
                Текущее состояние: <strong>{consentLabel(consent)}</strong>.
              </p>
              <div className="privacyConsentActions">
                <button type="button" className="privacyButtonSecondary" onClick={() => setAnalyticsConsent("denied")}>
                  Отключить аналитику
                </button>
                <button type="button" className="privacyButtonPrimary" onClick={() => setAnalyticsConsent("granted")}>
                  Разрешить аналитику
                </button>
              </div>
            </div>
            <p>
              После отключения новые события не отправляются. Это не удаляет данные, ранее переданные Яндексу;
              cookies Метрики можно удалить через настройки браузера.
            </p>
          </section>

          <section>
            <h2>7. Изменения политики</h2>
            <p>
              Политика может обновляться при изменении сайта, используемой аналитики или применимых требований.
              Актуальная версия всегда размещается на этой странице.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
