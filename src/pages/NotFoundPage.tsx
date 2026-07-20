import { Link } from "react-router-dom";

import styles from "./PageStyles";

export function NotFoundPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="not-found-title">
        <p className={styles.kicker}>404</p>
        <h1 id="not-found-title">Страница не найдена</h1>
        <p className={styles.lead}>
          Такого маршрута пока нет. Вернитесь на главную страницу сайта.
        </p>
        <div className={styles.actions}>
          <Link className={styles.secondaryLink} to="/">
            На главную
          </Link>
        </div>
      </section>
    </main>
  );
}
