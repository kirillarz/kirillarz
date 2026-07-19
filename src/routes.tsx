import type { RouteObject } from "react-router-dom";

import { EmployerPage } from "./pages/EmployerPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";

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
    path: "*",
    element: <NotFoundPage />,
  },
];
