import { MotionHeading } from "./PageMotion";
import styles from "./PageStyles";
import { ProjectCarousel } from "./ProjectCarousel";
import { ProjectActionIconView, ProjectFactIconView } from "./ProjectIcons";
import { projects, type ProjectAction } from "./projectsData";
import { motionReveal } from "./usePageMotion";

function ProjectActions({ actions }: { actions: readonly ProjectAction[] }) {
  return (
    <div className={styles.projectActions}>
      {actions.map((action, index) => {
        return (
          <a
            className={`${styles.projectAction} ${index === 0 ? styles.projectActionPrimary : ""}`}
            href={action.href}
            target="_blank"
            rel="noreferrer"
            key={action.label}
          >
            <ProjectActionIconView name={action.icon} />
            <span>{action.label}</span>
            <span aria-hidden="true">→</span>
          </a>
        );
      })}
    </div>
  );
}

export function ProjectsSection() {
  return (
    <section id="projects" className={styles.projectsSection} aria-labelledby="projects-title">
      <div className={styles.projectsInner}>
        <header className={styles.projectsIntro}>
          <p className={styles.projectsEyebrow} {...motionReveal("content")}>
            <span>04</span> / ПРОЕКТЫ
          </p>
          <MotionHeading
            id="projects-title"
            label="Проекты, которыми я особенно горжусь"
            segments={[
              { text: "Проекты, которыми" },
              { text: "я особенно горжусь" },
            ]}
          />
          <p {...motionReveal("content", 1)}>
            Разработка, координация команды и продуктовый подход
            <br className={styles.desktopBreak} /> в работающих учебных и командных кейсах.
          </p>
        </header>

        <div className={styles.projectsList}>
          {projects.map((project, index) => (
            <article
              className={`${styles.projectCard} ${index % 2 === 1 ? styles.projectCardReversed : ""}`}
              aria-labelledby={`${project.id}-title`}
              key={project.id}
              {...motionReveal("card", index)}
            >
              <ProjectCarousel project={project} />

              <div className={styles.projectContent}>
                <div className={styles.projectHeading}>
                  <p className={styles.projectCategory}>
                    {project.number} / {project.category}
                  </p>
                  <h3 id={`${project.id}-title`}>{project.title}</h3>
                  <p className={styles.projectDescription}>{project.description}</p>
                </div>

                <div className={styles.projectDetails}>
                  <dl className={styles.projectFacts}>
                    {project.facts.map((fact) => (
                      <div key={fact.label}>
                        <ProjectFactIconView name={fact.icon} />
                        <dt>{fact.label}:</dt>
                        <dd>{fact.value}</dd>
                      </div>
                    ))}
                  </dl>

                  <ul className={styles.projectTechnologies} aria-label={`Технологии проекта «${project.title}»`}>
                    {project.technologies.map((technology) => (
                      <li key={technology}>{technology}</li>
                    ))}
                  </ul>

                  <ProjectActions actions={project.actions} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
