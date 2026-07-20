import { useEffect } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { trackCurrentPage } from "./analytics/yandexMetrika";
import { routes } from "./routes";

const router = createBrowserRouter(routes, {
  basename: import.meta.env.BASE_URL,
});

export function App() {
  useEffect(() => {
    let animationFrame = window.requestAnimationFrame(trackCurrentPage);

    const unsubscribe = router.subscribe(() => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(trackCurrentPage);
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      unsubscribe();
    };
  }, []);

  return <RouterProvider router={router} />;
}
