import { Link } from "react-router-dom";

import styles from "./Page.module.css";

export function HomePage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="home-title">
        <p className={styles.kicker}>Портфолио</p>
        <h1 id="home-title">Кирилл Арзамасцев</h1>
        <p className={styles.lead}>
          Минимальный каркас личного сайта: главная страница, маршрут для
          работодателя и готовая основа для дальнейшей разработки.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primaryLink} to="/employer">
            Для работодателя
          </Link>
        </div>
      </section>
    </main>
  );
}
