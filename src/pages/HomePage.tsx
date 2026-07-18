import heroMinifigure from "../assets/hero-minifigure.png";
import { AboutSection } from "./AboutSection";
import { ContactsSection } from "./ContactsSection";
import styles from "./Page.module.css";
import { ProjectsSection } from "./ProjectsSection";
import { SkillsSection } from "./SkillsSection";

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
            Студент, который совмещает разработку, управление и организацию. Умеет превращать идеи в работающие
            проекты, координировать команду, общаться с заказчиком и защищать результат.
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
            <a className={styles.primaryLink} href="#about">
              Узнать обо мне
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </section>

      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <ContactsSection />
    </main>
  );
}
