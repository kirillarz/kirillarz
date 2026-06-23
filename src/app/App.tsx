import { Link, NavLink, Route, Routes } from "react-router-dom";

import { contacts, profile, projects, skillGroups, type LinkState } from "../data/portfolio";
import styles from "./App.module.css";

function ExternalLink({ href, children }: { href: string; children: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

function Action({ link }: { link: LinkState }) {
  if (link.status === "available") {
    return (
      <a className={styles.action} href={link.href} target="_blank" rel="noreferrer">
        {link.label}
      </a>
    );
  }

  return (
    <span className={styles.actionPending} aria-disabled="true" title={link.note}>
      {link.label}
      <small>{link.note}</small>
    </span>
  );
}

function Header() {
  return (
    <header className={styles.header}>
      <Link className={styles.brand} to="/">
        Кирилл Арзамасцев
      </Link>
      <nav className={styles.nav} aria-label="Основная навигация">
        <NavLink to="/">Главная</NavLink>
        <a href="/#projects">Проекты</a>
        <NavLink to="/employer">Для работодателя</NavLink>
      </nav>
    </header>
  );
}

function ContactActions() {
  return (
    <div className={styles.actions}>
      <ExternalLink href={contacts.github.href}>{contacts.github.label}</ExternalLink>
      <ExternalLink href={contacts.telegram.href}>{contacts.telegram.label}</ExternalLink>
      <span className={styles.actionPending} aria-disabled="true" title={contacts.resume.note}>
        {contacts.resume.label}
        <small>{contacts.resume.note}</small>
      </span>
    </div>
  );
}

function ProjectsSection() {
  return (
    <section className={styles.section} id="projects">
      <p className={styles.kicker}>Проекты</p>
      <h2>Три проекта для первой версии</h2>
      <div className={styles.projectGrid}>
        {projects.map((project) => (
          <article className={styles.projectCard} key={project.title}>
            <h3>{project.title}</h3>
            <p>{project.summary}</p>
            <p className={styles.role}>{project.role}</p>
            <ul className={styles.tags} aria-label={`Ключевые факты: ${project.title}`}>
              {project.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
            <div className={styles.cardActions}>
              {project.links.map((link) => (
                <Action link={link} key={link.label} />
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <>
      <section className={styles.hero}>
        <div>
          <p className={styles.kicker}>{profile.heroRole}</p>
          <h1>{profile.name}</h1>
          <p className={styles.lead}>{profile.headline}</p>
          <p>{profile.shortDescription}</p>
          <a className={styles.primaryAction} href="#projects">
            Смотреть проекты
          </a>
        </div>
        <div className={styles.placeholder} aria-hidden="true">
          <span>PM office</span>
          <span>Kanban</span>
          <span>Release</span>
        </div>
      </section>

      <section className={styles.section}>
        <p className={styles.kicker}>Обо мне</p>
        <h2>Разработка, управление и организация</h2>
        <p>
          Мне интересно создавать продукты на стыке разработки, управления и
          AI-интеграций. Я беру на себя технические задачи и помогаю команде
          двигаться к результату.
        </p>
      </section>

      <ProjectsSection />

      <section className={styles.section}>
        <p className={styles.kicker}>Навыки</p>
        <h2>Компактная карта компетенций</h2>
        <div className={styles.skillGrid}>
          {skillGroups.map((group) => (
            <article className={styles.skillCard} key={group.title}>
              <h3>{group.title}</h3>
              <ul className={styles.tags}>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function EmployerPage() {
  return (
    <>
      <section className={styles.heroCompact}>
        <p className={styles.kicker}>Для работодателя</p>
        <h1>{profile.employerRole}</h1>
        <p className={styles.lead}>{profile.employerSummary}</p>
        <ContactActions />
      </section>

      <section className={styles.section}>
        <h2>Направления</h2>
        <ul className={styles.tags}>
          {profile.directions.map((direction) => (
            <li key={direction}>{direction}</li>
          ))}
        </ul>
      </section>

      <ProjectsSection />
    </>
  );
}

export function App() {
  return (
    <div className={styles.appShell}>
      <Header />
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/employer" element={<EmployerPage />} />
        </Routes>
      </main>
    </div>
  );
}
