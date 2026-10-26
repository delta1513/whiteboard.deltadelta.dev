<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent guide for this template

This file is written in Simplified Technical English. Each sentence has one meaning. Read all of it before you change any file.

## 1. What this repository is

This repository is a template. It contains a hello-world Next.js app. The app builds to a static site. Cloudflare Workers serves the static site.

The user copies this template to make a hobby project. Your task is to build the app that the user asks for. You start from this template.

Cloudflare builds and deploys the site by itself. Cloudflare does this each time someone pushes to the `main` branch. No GitHub workflow is necessary. Do not add one.

## 2. Stack

| Part | Choice |
| --- | --- |
| Framework | Next.js 16 with the App Router |
| Language | TypeScript |
| Output | Static export (`output: "export"`) to the `out/` folder |
| Host | A Cloudflare Worker that serves static assets |
| Deploy tool | Wrangler (`wrangler.jsonc`) |
| Package manager | npm |

The Next.js version in this repository is new. It has breaking changes. Your training data can be wrong. Before you write code, read the guide in `node_modules/next/dist/docs/`. Run `npm install` first if that folder does not exist.

## 3. Files in this repository

| Path | Purpose |
| --- | --- |
| `app/` | Pages and layouts (App Router) |
| `app/layout.tsx` | Root layout and page metadata |
| `app/page.tsx` | The home page |
| `app/globals.css` | Global CSS |
| `next.config.ts` | Sets `output: "export"` and `images.unoptimized` |
| `wrangler.jsonc` | Tells Cloudflare the Worker name, the build command, and the asset folder |
| `package.json` | Scripts and dependencies |
| `package-lock.json` | Locked dependency versions. Commit it. |
| `tsconfig.json` | TypeScript settings. The `@/*` alias points to the repository root. |
| `eslint.config.mjs` | Lint rules |
| `out/` | Build output. Git ignores it. Do not edit it. |

## 4. Commands

| Command | Result |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the local dev server |
| `npm run build` | Build the static site to `out/` |
| `npm run lint` | Run ESLint |
| `npm run preview` | Build, then serve `out/` with `wrangler dev` |
| `npm run deploy` | Deploy by hand with `wrangler deploy` |

Cloudflare runs `npm run build`. The `build.command` field in `wrangler.jsonc` sets this command. Do not remove that field.

## 5. How to start a new project from this template

Do these steps in order.

1. Choose a project name. Use lowercase letters, numbers, and hyphens.
2. Set `name` in `wrangler.jsonc` to the project name.
3. Set `name` in `package.json` to the project name.
4. Update `title` and `description` in `app/layout.tsx`.
5. Update `README.md` for the new project.
6. Run `npm install`.
7. Build the features that the user asks for. See sections 6 and 7.
8. Do the checks in section 9.
9. Commit and push. See section 10.

The `name` in `wrangler.jsonc` must be the same as the Worker name in Cloudflare. If the names are different, the Cloudflare build fails. Tell the user the name that you chose.

## 6. What the static export can and cannot do

The static export runs Next.js at build time only. The result is HTML, CSS, and JavaScript files. No server runs after the build.

These features work:

- Server Components. They run during `npm run build`.
- Client Components (`'use client'`).
- Client-side navigation with `next/link`.
- Client-side data fetching in the browser.
- Dynamic routes that have `generateStaticParams()`.
- Route Handlers that have `export const dynamic = 'force-static'` and use only `GET`.
- CSS, CSS Modules, and Tailwind CSS.
- `next/image` with `images.unoptimized: true`. This is the current setting.
- Browser APIs such as `window` and `localStorage`, inside `useEffect` only.

These features do not work. The build fails, or the feature does nothing:

- Server Actions.
- Cookies and request headers.
- Route Handlers that read the request.
- Dynamic routes without `generateStaticParams()`.
- `rewrites`, `redirects`, and `headers` in `next.config.ts`.
- Proxy (middleware).
- Incremental Static Regeneration and Draft Mode.
- Image optimization with the default image loader.

If the user needs a feature from the second list, stop. The user needs a different template. See section 8.

To store data between visits, use `localStorage` in a Client Component. To load data, use a public API from the browser. You can also load data at build time in a Server Component.

## 7. Rules for code changes

- Keep `output: "export"` in `next.config.ts`. Keep `images: { unoptimized: true }` too.
- Put static files, such as images and fonts, in a `public/` folder at the repository root. Create the folder if it does not exist. Next.js copies these files to `out/`. Refer to them with a path that starts with `/`.
- Add a page with a new folder in `app/`. The folder contains a `page.tsx` file. The folder name is the URL path.
- Add a `not-found.tsx` file in `app/` to change the 404 page. Cloudflare serves `404.html` for unknown URLs.
- Use `next/link` for links between pages. Cloudflare serves `/about` and `/about/` correctly. The `html_handling` setting in `wrangler.jsonc` controls this.
- Use a Client Component when the code needs state, effects, event handlers, or browser APIs.
- Do not use Node.js APIs in code that runs in the browser.
- Do not add a database, an API server, or secret keys. A static site cannot keep a secret.
- To use Tailwind CSS, install `tailwindcss` and `@tailwindcss/postcss`. Create `postcss.config.mjs` with the `@tailwindcss/postcss` plugin. Add `@import "tailwindcss";` to `app/globals.css`.
- Keep `wrangler.jsonc` valid. Keep `assets.directory` set to `./out`. Keep `not_found_handling` set to `404-page`.
- Update `compatibility_date` in `wrangler.jsonc` only if a Cloudflare feature needs a newer date.
- Do not use `next start`. It does not work with a static export.
- Add a new dependency only if the user needs it. Run `npm install <package>`. Commit the changed `package-lock.json`.

## 8. If the app needs a server

This template serves static files only. Some apps need server code. Some apps need a database or a third-party service.

If an app needs server code, do not add it to this template. Tell the user that this template does not support it. For a dynamic app that uses no third-party services, the user can use a Worker together with a Cloudflare container. For an app that uses a database or storage, the user can use Cloudflare bindings.

Cloudflare documentation exists in markdown form. Add `index.md` to the end of any documentation URL. For example, read `https://developers.cloudflare.com/workers/index.md`. This uses fewer tokens than the HTML page.

## 9. Checks before you push

Do these checks in order. Fix each problem before you go to the next check.

1. Run `npm run lint`. It must pass.
2. Run `npm run build`. It must pass, and `out/index.html` must exist.
3. Run `npx wrangler deploy --dry-run`. It must show that it read the files from the assets folder.
4. Run `git status`. Make sure that no `out/`, `node_modules/`, `.env`, or `.wrangler/` files are staged.

Optional: run `npm run preview` and open the local address. This shows the site in the Workers runtime. If you cannot open a browser, skip this step.

## 10. Git rules

- Push directly to `main`. This is a hobby project. No pull request is necessary. The user can tell you to use a branch or a pull request instead.
- Never force-push. Never rewrite history. Never use `git push --force` or `git reset --hard` on shared history.
- Keep the git history. Add new commits.
- Write clear commit messages.
- If a push is rejected, run `git pull --no-rebase` and push again. If you cannot resolve a conflict, ask the user.
- Do not commit secrets.

After you push, Cloudflare builds the site. You cannot see the Cloudflare build from here. Tell the user to check the build in the Cloudflare dashboard.

## 11. What the user must do in Cloudflare

You cannot do these steps. The user does them one time. Tell the user about them if the site does not deploy.

### 11.1 Connect Cloudflare to GitHub (one time for each account)

1. Log in to the Cloudflare dashboard.
2. Go to Workers & Pages.
3. Start to create an application. Choose the GitHub option.
4. Follow the prompts. Install the Cloudflare app in GitHub.
5. Give the app access to the repository. The user can choose all repositories or only selected repositories.

### 11.2 Create the Worker (one time for each project)

1. Make the GitHub repository first. Use this template.
2. In the Cloudflare dashboard, go to Workers & Pages.
3. Click Create application.
4. Choose GitHub.
5. Select the repository. Follow the prompts.
6. Make sure that the Worker name is the same as `name` in `wrangler.jsonc`.
7. Leave the build command and the deploy command as the defaults, unless the user has a reason to change them. The repository files already set the build.
8. Save and deploy.

### 11.3 Make the site public

1. Open the Worker in the Cloudflare dashboard.
2. Go to Settings, then Domains & Routes.
3. Enable the `workers.dev` domain.
4. Open the `workers.dev` address. The site is now public.

The user can add a custom domain in the same place.

### 11.4 After the setup

Each push to `main` starts a new build and deploy. The build log is in the Worker, under Deployments or Builds. If the build fails, read the log. Fix the error in the code. Push again.

## 12. Common problems

| Problem | Cause and fix |
| --- | --- |
| The Cloudflare build fails with a name error | The Worker name in Cloudflare is different from `name` in `wrangler.jsonc`. Make the two names the same. |
| The Cloudflare build cannot find a package | `package-lock.json` is not committed, or it is out of date. Run `npm install` and commit the file. |
| `npm run build` fails on a server feature | The code uses a feature from the second list in section 6. Remove it. |
| A dynamic route fails in the build | Add `generateStaticParams()` to the route. |
| `window is not defined` | Code that uses `window` runs on the server. Move it into `useEffect` in a Client Component. |
| The site shows the 404 page for a valid URL | Check that `out/` contains the page. Check `html_handling` in `wrangler.jsonc`. |
| An image does not load | Put the file in `public/`. Use a path that starts with `/`. |
| The site shows old content | Wait for the Cloudflare build to finish. Then reload with the cache cleared. |
