# Sprint 3 Backlog

- **Implement `POST /auth/refresh` endpoint**: The `access_token` has a short lifespan (15 minutes). We need an endpoint to exchange a valid `refresh_token` (from the HttpOnly cookie) for a new `access_token` pair to ensure sessions aren't unexpectedly interrupted.
