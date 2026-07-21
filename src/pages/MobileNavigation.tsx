import { useEffect, useRef, useState, type MouseEvent } from "react";

import styles from "./PageStyles";

const navigationItems = [
  { id: "top", label: "Начало" },
  { id: "about", label: "Обо мне" },
  { id: "skills", label: "Навыки" },
  { id: "projects", label: "Проекты" },
  { id: "hobby", label: "Хобби" },
  { id: "contacts", label: "Контакты" },
] as const;

export type NavigationSectionId = (typeof navigationItems)[number]["id"];

type PageNavigationProps = {
  onNavigate?: (sectionId: NavigationSectionId, event: MouseEvent<HTMLAnchorElement>) => void;
};

export function PageNavigation({ onNavigate }: PageNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState("top");
  const navigationRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sections = navigationItems
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => section !== null);

    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

        if (visibleEntry) setActiveSectionId(visibleEntry.target.id);
      },
      { rootMargin: "-18% 0px -62%", threshold: [0, 0.1, 0.35, 0.6] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!navigationRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const activeLabel = navigationItems.find((item) => item.id === activeSectionId)?.label ?? "Начало";

  return (
    <nav className={styles.pageNavigation} ref={navigationRef} aria-label="Навигация по странице">
      <div className={styles.desktopNavigationBar}>
        <a className={styles.desktopNavigationBrand} href="#top">
          Кирилл
        </a>
        <div className={styles.desktopNavigationLinks}>
          {navigationItems.map((item) => (
            <a
              href={`#${item.id}`}
              aria-current={activeSectionId === item.id ? "location" : undefined}
              onClick={(event) => onNavigate?.(item.id, event)}
              key={item.id}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>

      <div className={styles.mobileNavigationBar}>
        <a className={styles.mobileNavigationBrand} href="#top" onClick={() => setIsOpen(false)}>
          Кирилл
        </a>
        <span className={styles.mobileNavigationCurrent} aria-live="polite">
          {activeLabel}
        </span>
        <button
          className={styles.mobileNavigationToggle}
          type="button"
          aria-expanded={isOpen}
          aria-controls="mobile-navigation-menu"
          onClick={() => setIsOpen((current) => !current)}
        >
          <span>Меню</span>
          <span className={styles.mobileNavigationIcon} aria-hidden="true" />
        </button>
      </div>

      <div
        className={styles.mobileNavigationMenu}
        id="mobile-navigation-menu"
        data-open={isOpen ? "true" : "false"}
      >
        {navigationItems.map((item) => (
          <a
            href={`#${item.id}`}
            aria-current={activeSectionId === item.id ? "location" : undefined}
            onClick={(event) => {
              setIsOpen(false);
              onNavigate?.(item.id, event);
            }}
            key={item.id}
          >
            <span>{item.label}</span>
            <span aria-hidden="true">↘</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
