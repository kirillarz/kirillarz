import { reachMetrikaGoal } from "../analytics/yandexMetrika";
import { Link } from "react-router-dom";
import { MotionHeading } from "./PageMotion";
import styles from "./PageStyles";
import { motionReveal } from "./usePageMotion";

const contacts = [
  {
    label: "GitHub",
    handle: "kirillarz",
    href: "https://github.com/kirillarz",
    goal: "github_profile_open",
    variant: "github",
  },
  {
    label: "Telegram",
    handle: "@kirillarz",
    href: "https://t.me/kirillarz",
    goal: "contact_telegram",
    variant: "telegram",
  },
] as const;

export function ContactsSection() {
  return (
    <section id="contacts" className={styles.contactsSection} aria-labelledby="contacts-title">
      <div className={styles.contactsInner}>
        <header className={styles.contactsIntro}>
          <p className={styles.contactsEyebrow} {...motionReveal("content")}>
            <span>06</span> / КОНТАКТЫ
          </p>
          <MotionHeading
            id="contacts-title"
            label="Будем на связи"
            segments={[{ text: "Будем" }, { text: "на связи" }]}
          />
          <p {...motionReveal("content", 1)}>Профили, где можно посмотреть код и написать напрямую.</p>
        </header>

        <ul className={styles.contactsList}>
          {contacts.map((contact, index) => (
            <li key={contact.label} {...motionReveal("card", index)}>
              <a
                className={`${styles.contactCard} ${
                  contact.variant === "telegram"
                    ? styles.contactCardTelegram
                    : styles.contactCardGithub
                }`}
                href={contact.href}
                target="_blank"
                rel="noreferrer"
                onClick={() => reachMetrikaGoal(contact.goal)}
              >
                <span className={styles.contactCardShine} aria-hidden="true" />
                <span className={styles.contactCardHeader}>
                  <span className={styles.contactCardLabel}>{contact.label}</span>
                  <span className={styles.contactCardArrow} aria-hidden="true">↗</span>
                </span>
                <strong className={styles.contactCardHandle}>{contact.handle}</strong>
                <span className={styles.contactCardStuds} aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p className={styles.contactsPrivacyLink}>
          <Link to="/privacy">Политика конфиденциальности и настройки cookies</Link>
        </p>
      </div>
    </section>
  );
}
