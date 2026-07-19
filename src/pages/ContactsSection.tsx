import styles from "./Page.module.css";

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
    <section className={styles.contactsSection} aria-labelledby="contacts-title">
      <div className={styles.contactsInner}>
        <header className={styles.contactsIntro}>
          <p className={styles.contactsEyebrow}>
            <span>06</span> / КОНТАКТЫ
          </p>
          <h2 id="contacts-title">Будем на связи</h2>
          <p>Профили, где можно посмотреть код и написать напрямую.</p>
        </header>

        <ul className={styles.contactsList}>
          {contacts.map((contact) => (
            <li key={contact.label}>
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
