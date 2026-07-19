import { MotionHeading } from "./PageMotion";
import styles from "./Page.module.css";
import { motionReveal } from "./usePageMotion";

const contacts = [
  {
    label: "GitHub",
    handle: "kirillarz",
    href: "https://github.com/kirillarz",
  },
  {
    label: "Telegram",
    handle: "@kirillarz",
    href: "https://t.me/kirillarz",
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
              <a href={contact.href} target="_blank" rel="noreferrer">
                <span>{contact.label}</span>
                <strong>{contact.handle}</strong>
                <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
