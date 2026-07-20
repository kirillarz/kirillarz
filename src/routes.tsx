import type { RouteObject } from "react-router-dom";

import { EmployerPage } from "./pages/EmployerPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PrivacyPage } from "./pages/PrivacyPage";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/employer",
    element: <EmployerPage />,
  },
  {
    path: "/privacy",
    element: <PrivacyPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
];
