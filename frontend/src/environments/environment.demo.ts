// Public demo build: no backend is available, so every HTTP call is answered
// by the in-memory API in app/core/demo (see demo-backend.interceptor.ts).
export const environment = {
  production: true,
  demo: true,
  apiUrl: '/demo-api'
};
