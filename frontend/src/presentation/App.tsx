import { createBrowserRouter, RouterProvider } from 'react-router-dom';
{{ ... }}

const router = createBrowserRouter(
  [
    {{ ... }}
  ],
  {
    future: {
      v7_startTransition: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true
    }
  }
);
