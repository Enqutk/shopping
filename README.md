# Shopping

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>


✨ Your new, shiny [Nx workspace](https://nx.dev) is ready ✨.


[Learn more about this workspace setup and its capabilities](https://nx.dev/nx-api/next?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects) or run `npx nx graph` to visually explore what was created. Now, let's get you up to speed!

## Local development

1. **PostgreSQL** — ensure a server is listening on port `5432` and create a database named `shopping` (or point `DATABASE_URL` at your own DB):

   ```sh
   # Example with Docker (adjust container name / user as needed)
   docker exec <postgres-container> psql -U postgres -d postgres -c "CREATE DATABASE shopping;"
   ```

2. **Migrations** — from the repo root:

   ```sh
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/shopping" npx drizzle-kit migrate
   ```

3. **API** — in one terminal (replace secrets with real values for Google OAuth in non-local use):

   ```sh
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/shopping" \
   JWT_SECRET="your-jwt-secret-at-least-32-chars" \
   GOOGLE_CLIENT_ID="your-google-client-id" \
   GOOGLE_CLIENT_SECRET="your-google-client-secret" \
   FRONTEND_URL="http://localhost:4200" \
   PORT=3000 \
   npx nx serve api --configuration=development
   ```

   API base URL: `http://localhost:3000/api`

   **Google Sign-In (`401: invalid_client` / “OAuth client was not found”)** — create an OAuth **Web client** in [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → APIs & Services → Credentials → Create credentials → OAuth client ID. Set **Authorized redirect URI** to exactly:

   `http://localhost:3000/api/auth/google/callback`

   (If the API runs on another host/port, set `GOOGLE_CALLBACK_URL` in `.env` to the full callback URL and add that same URI in Google Cloud.) Put the **Client ID** and **Client secret** in `.env` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` — do not use placeholder values.

4. **Frontend** — in another terminal (port `4200` avoids clashing with the API on `3000`):

   ```sh
   NEXT_PUBLIC_API_URL="http://localhost:3000/api" npx nx dev frontend -- --port 4200
   ```

   Optional: `NEXT_PUBLIC_REALTIME_URL=http://localhost:3000` if the Socket.IO server is not the same origin as `NEXT_PUBLIC_API_URL` without the `/api` suffix (otherwise the client strips `/api` automatically).

   Open **http://localhost:4200**

   **Admin dashboard** (requires a user with `ADMIN` role): **http://localhost:4200/admin** — analytics, recent orders, product and order management.

5. **Environment template** — copy `.env.example` to `.env` and fill in secrets before deploying.

## Docker (deployment-ready baseline)

Start PostgreSQL, API, and frontend:

```sh
cp .env.example .env
# Edit .env with real JWT_SECRET and Google OAuth credentials

docker compose up --build
```

- API: http://localhost:3000/api  
- Frontend: http://localhost:4200  

Run migrations against the compose Postgres (from host):

```sh
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/shopping" npx drizzle-kit migrate
```

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs lint, migrations, and production builds for `api` and `frontend` on push/PR to `main` or `master`.

## Run tasks

To run the dev server for your app, use:

```sh
npx nx dev frontend
```

To create a production bundle:

```sh
npx nx build frontend
```

To see all available targets to run for a project, run:

```sh
npx nx show project frontend
```

These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

[More about running tasks in the docs &raquo;](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Add new projects

While you could add new projects to your workspace manually, you might want to leverage [Nx plugins](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) and their [code generation](https://nx.dev/features/generate-code?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) feature.

Use the plugin's generator to create new projects.

To generate a new application, use:

```sh
npx nx g @nx/next:app demo
```

To generate a new library, use:

```sh
npx nx g @nx/react:lib mylib
```

You can use `npx nx list` to get a list of installed plugins. Then, run `npx nx list <plugin-name>` to learn about more specific capabilities of a particular plugin. Alternatively, [install Nx Console](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) to browse plugins and generators in your IDE.

[Learn more about Nx plugins &raquo;](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) | [Browse the plugin registry &raquo;](https://nx.dev/plugin-registry?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Set up CI!

### Step 1

To connect to Nx Cloud, run the following command:

```sh
npx nx connect
```

Connecting to Nx Cloud ensures a [fast and scalable CI](https://nx.dev/ci/intro/why-nx-cloud?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) pipeline. It includes features such as:

- [Remote caching](https://nx.dev/ci/features/remote-cache?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task distribution across multiple machines](https://nx.dev/ci/features/distribute-task-execution?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Automated e2e test splitting](https://nx.dev/ci/features/split-e2e-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task flakiness detection and rerunning](https://nx.dev/ci/features/flaky-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

### Step 2

Use the following command to configure a CI workflow for your workspace:

```sh
npx nx g ci-workflow
```

[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/nx-api/next?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:
- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
