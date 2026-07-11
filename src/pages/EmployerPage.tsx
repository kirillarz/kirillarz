import { Link } from "react-router-dom";

import styles from "./Page.module.css";

export function EmployerPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="employer-title">
        <p className={styles.kicker}>Работодателю</p>
        <h1 id="employer-title">Страница для будущего карьерного контента</h1>
        <p className={styles.lead}>
          Здесь позже появятся опыт, проекты, навыки и контактные сценарии.
          Сейчас страница подтверждает маршрутизацию и базовую структуру сайта.
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
