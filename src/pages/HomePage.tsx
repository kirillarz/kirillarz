import { Link } from "react-router-dom";

import heroMinifigure from "../assets/hero-minifigure.png";
import styles from "./Page.module.css";

const heroSkills = [
  "Product Management",
  "Project Management",
  "Backend",
  "React + TypeScript",
  "FastAPI",
  "AI-интеграции",
];

export function HomePage() {
  return (
    <main className={`${styles.page} ${styles.homePage}`}>
      <section className={styles.homeHero} aria-labelledby="home-title">
        <div className={styles.heroVisual}>
          <img
            className={styles.heroImage}
            src={heroMinifigure}
            alt="Стилизованная конструкторная минифигурка Кирилла в костюме"
          />
        </div>

        <div className={styles.heroContent}>
          <p className={styles.kicker}>Начинающий product manager и разработчик</p>
          <h1 id="home-title">Кирилл Арзамасцев</h1>
          <p className={styles.heroSlogan}>
            Собираю AI-продукты, команды и работающие решения.
          </p>
          <p className={styles.lead}>
            Кирилл Арзамасцев — студент, который совмещает разработку,
            управление и организацию. Умеет превращать идеи в работающие
            проекты, координировать команду, общаться с заказчиком и защищать
            результат.
          </p>

          <ul className={styles.skillTape} aria-label="Ключевые направления">
            {heroSkills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>

          <div className={styles.actions}>
            <Link className={styles.primaryLink} to="/employer">
              Для работодателя
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
