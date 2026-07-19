import heroMinifigure from "../assets/hero-minifigure.png";
import { AboutSection } from "./AboutSection";
import { ContactsSection } from "./ContactsSection";
import { HobbySection } from "./HobbySection";
import { MobileNavigation } from "./MobileNavigation";
import styles from "./Page.module.css";
import { ProjectsSection } from "./ProjectsSection";
import { SkillsSection } from "./SkillsSection";

const heroRoles = [
  "Product Manager",
  "Project Manager",
  "Backend Developer",
  "Business Analyst",
  "AI Product Builder",
  "Team Coordinator",
];

export function HomePage() {
  return (
    <main className={`${styles.page} ${styles.homePage}`}>
      <MobileNavigation />
      <section id="top" className={styles.homeHero} aria-labelledby="home-title">
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

          <div className={styles.roleMarquee} data-testid="hero-role-marquee">
            <span className={styles.srOnly}>Роли: {heroRoles.join(", ")}</span>
            <div className={styles.roleTrack} data-testid="hero-role-track" aria-hidden="true">
              {["primary", "duplicate"].map((group) => (
                <div className={styles.roleGroup} data-role-group={group} key={group}>
                  {heroRoles.map((role) => (
                    <span className={styles.rolePill} key={`${group}-${role}`}>
                      {role}
                    </span>
                  ))}
                </div>
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
      <HobbySection />
      <ContactsSection />
    </main>
  );
}
