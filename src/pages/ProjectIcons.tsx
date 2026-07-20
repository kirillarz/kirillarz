import type { ProjectActionIcon, ProjectFactIcon } from "./projectsData";

export function ProjectFactIconView({ name }: { name: ProjectFactIcon }) {
  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "briefcase":
      return (
        <svg {...commonProps}>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" />
        </svg>
      );
    case "people":
      return (
        <svg {...commonProps}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5.5a3 3 0 0 1 0 5M17 14a5 5 0 0 1 4 4.9V20" />
        </svg>
      );
    case "platform":
      return (
        <svg {...commonProps}>
          <path d="M4 5h16v11H4zM8 20h8M12 16v4" />
          <path d="m8 10 2.2 2L16 7" />
        </svg>
      );
    case "result":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l3 2M9 2h6M12 5V2M18 6l1.5-1.5" />
        </svg>
      );
    case "status":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 2.6 2.6L16.5 9" />
        </svg>
      );
    case "user":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="7" r="4" />
          <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
        </svg>
      );
  }
}

export function ProjectActionIconView({ name }: { name: ProjectActionIcon }) {
  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "external":
      return (
        <svg {...commonProps}>
          <path d="M14 5h5v5M19 5l-8 8" />
          <path d="M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
        </svg>
      );
    case "file":
      return (
        <svg {...commonProps}>
          <path d="M6 3h8l4 4v14H6zM14 3v5h5M9 13h6M9 17h6" />
        </svg>
      );
  }
}
