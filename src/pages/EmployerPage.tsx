import { Link } from "react-router-dom";

import styles from "./PageStyles";

export function EmployerPage() {
  return (
    <main className={`${styles.page} ${styles.employerPage}`}>
      <article className={styles.employerCard} aria-labelledby="employer-title">
        <Link className={styles.employerBackLink} to="/">
          <span aria-hidden="true">←</span> На главную
        </Link>

        <header className={styles.employerIntro}>
          <p className={styles.employerEyebrow}>КРАТКО ДЛЯ РАБОТОДАТЕЛЯ</p>
          <h1 id="employer-title">Кирилл Арзамасцев</h1>
          <p className={styles.employerRole}>Начинающий product manager и разработчик</p>
          <p className={styles.employerLead}>
            Ищу возможности развиваться в product management и технических продуктовых ролях. Рассматриваю стажировки,
            junior-позиции и проектное сотрудничество, где смогу сочетать управление, коммуникацию и техническую базу.
          </p>
        </header>

        <div className={styles.employerGrid}>
          <section aria-labelledby="employer-directions">
            <h2 id="employer-directions">Направления</h2>
            <ul className={styles.employerTags}>
              <li>Product Manager</li>
              <li>Project Manager</li>
              <li>Backend Developer</li>
              <li>Business Analyst</li>
            </ul>
          </section>

          <section aria-labelledby="employer-education">
            <h2 id="employer-education">Образование</h2>
            <p>Студент 2 курса УрФУ по направлению «Прикладной искусственный интеллект».</p>
            <p className={styles.employerMeta}>2025–2029 · очная форма</p>
          </section>

          <section className={styles.employerProjects} aria-labelledby="employer-projects">
            <h2 id="employer-projects">Ключевые проекты</h2>
            <ul>
              <li>
                <strong>AI-агент для подбора помещений</strong>
                <span>PM + Frontend · команда 6 человек · Сбер · 99/100</span>
              </li>
              <li>
                <strong>BotNetSchool</strong>
                <span>Fullstack / Bot Developer · индивидуальный проект</span>
              </li>
              <li>
                <strong>PM Simulator</strong>
                <span>Автор идеи и разработчик · индивидуальный экзаменационный проект</span>
              </li>
            </ul>
          </section>

          <section aria-labelledby="employer-strengths">
            <h2 id="employer-strengths">Сильные стороны</h2>
            <p>
              Умею объяснять идеи, координировать работу команды и сохранять фокус на результате — даже когда в проекте
              появляется немного контролируемого хаоса.
            </p>
          </section>

          <section className={styles.employerAchievements} aria-labelledby="employer-achievements">
            <h2 id="employer-achievements">Достижения</h2>
            <ul>
              <li><strong>2022</strong> · 1 место на ITFest, проект NotifyBot</li>
              <li><strong>2023</strong> · 2 место на «Интеллектуалах XXI века», проект BotNetSchool</li>
              <li><strong>2023</strong> · финалист «Цифровых стартов»</li>
            </ul>
          </section>

          <section className={styles.employerContacts} aria-labelledby="employer-contacts">
            <h2 id="employer-contacts">Профили</h2>
            <p>
              <a href="https://github.com/kirillarz" target="_blank" rel="noreferrer">GitHub ↗</a>
              <a href="https://t.me/kirillarz" target="_blank" rel="noreferrer">Telegram ↗</a>
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
