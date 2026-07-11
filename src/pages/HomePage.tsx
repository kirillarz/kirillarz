import { Link } from "react-router-dom";

import heroMinifigure from "../assets/hero-minifigure.png";
import styles from "./Page.module.css";

const heroSkills = [
  "Backend",
  "AI Products",
  "Project Management",
  "Systems Analysis",
];

export function HomePage() {
  return (
    <main className={`${styles.page} ${styles.homePage}`}>
      <section className={styles.homeHero} aria-labelledby="home-title">
        <div className={styles.heroVisual}>
          <div className={styles.heroImageFrame}>
            <img
              className={styles.heroImage}
              src={heroMinifigure}
              alt="Стилизованная конструкторная минифигурка Кирилла в костюме"
            />
          </div>
        </div>

        <div className={styles.heroContent}>
          <h1 id="home-title">Кирилл Арзамасцев</h1>
          <p className={styles.heroDescription}>
            Разрабатываю цифровые продукты,<br className={styles.desktopBreak} /> объединяю backend, AI и управление
            командой.
          </p>

          <div className={styles.skillMarquee}>
            <span className={styles.srOnly}>Ключевые направления: {heroSkills.join(", ")}</span>
            <div className={styles.skillTrack} aria-hidden="true">
              {heroSkills.map((skill) => (
                <span className={styles.skillPill} key={skill}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <Link className={styles.primaryLink} to="/employer">
              Узнать обо мне
              <span aria-hidden="true">→</span>
            </Link>
            <span className={styles.ctaHint} aria-hidden="true">
              <span>↖</span> Нажми — будет эффектно
            </span>
          </div>

          <span className={styles.lightMark} aria-hidden="true" />
        </div>
      </section>
    </main>
  );
}
