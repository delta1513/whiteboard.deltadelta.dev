---
name: initial-setup
description: Use this skill when this repository is first created from the template. It lists the template text and settings that you must change, and it tells you how to write public/llms.txt for the new site. Use it before you build any feature.
---

# Initial setup

This skill is written in Simplified Technical English. Each sentence has one meaning.

Use this skill one time, when the user first creates a project from this template. The repository still has the template name and the template text. Your task is to replace them with the details of the new project.

Read `AGENTS.md` before you start. Do the steps below in order.

## 1. Ask the user about the website

You need facts to write good text. Ask the user these questions. Ask them in one message. Do not guess.

1. What is the name of the project?
2. What does the website do? Use one or two sentences.
3. Who will use the website?
4. What pages or features does the user want?
5. Does the website need a server, a database, or a secret key? If yes, stop. Read section 8 in `AGENTS.md` and tell the user that this template cannot do it.

If the user already gave some of these facts, do not ask for them again. If the user gives a short answer, ask one more question to get the details that you need for `public/llms.txt`.

## 2. Choose the project name

1. Use lowercase letters, numbers, and hyphens only.
2. Keep the name short. Make it match the project.
3. Tell the user the name that you chose. The name in Cloudflare must be the same.

## 3. Change the template values

Search the repository for the old name `agentic-cloudflare-static-site-template`. Do not search in `node_modules/`, `out/`, or `.next/`. Replace each use that is part of the template.

| File | What to change |
| --- | --- |
| `wrangler.jsonc` | Set `name` to the project name. |
| `package.json` | Set `name` to the project name. |
| `package-lock.json` | Run `npm install`. This updates the `name` fields. Do not edit the file by hand. |
| `app/layout.tsx` | Set `title` and `description` in `metadata`. |
| `app/page.tsx` | Replace the template text with the home page of the new project. Remove the text about the template, its rationale, its limitations, and how to use it. Remove the footer link to the template repository. |
| `README.md` | Rewrite the file for the new project. Remove the link to the template demo. Remove the template text. Add what the project does and how to run it. |
| `public/llms.txt` | Rewrite the file. See section 4. |

Do not change these values:

- `output: "export"` and `images: { unoptimized: true }` in `next.config.ts`.
- `build.command`, `assets.directory`, and `assets.not_found_handling` in `wrangler.jsonc`.

If you find other references to the template, change them too. Do not remove the rules in `AGENTS.md` unless the user asks you to.

## 4. Write `public/llms.txt`

The file `public/llms.txt` gives context to an AI agent that visits the site. Next.js copies it to `out/llms.txt`. The Worker serves it at `/llms.txt`.

The format comes from https://llmstxt.org/index.md. Keep the sections in this order:

1. An H1 heading with the project name. This is the only required part.
2. A blockquote with a short summary of the website.
3. Zero or more paragraphs with more detail. Do not use headings in these paragraphs.
4. Zero or more H2 sections. Each section is a list of links.

Write each link in this form:

```
- [Link title](https://example.com/page): Short note about the page
```

Follow these rules:

- Write what the website does, who it is for, and what its pages are. Use the facts from section 1.
- Do not leave any text about the template in the file. Remove the links that are about the template.
- Use full URLs for links. The `workers.dev` address or the custom domain is not known yet. If you do not know the address, link to the GitHub repository of the new project. Tell the user to add the site address when they know it.
- Put links that are less important in an H2 section named `Optional`.
- Keep the file short. Use plain text. Do not put secrets in it.
- Add a link for each important page when you add a page later. Keep the file correct when the site changes.

## 5. Check your work

Do the checks in section 9 of `AGENTS.md`. In addition, do these checks:

1. Search for `agentic-cloudflare-static-site-template`. Make sure that no template reference remains by mistake.
2. Make sure that `out/llms.txt` exists after `npm run build`.
3. Make sure that `wrangler.jsonc` `name` is the same as `package.json` `name`.

## 6. Push and tell the user

1. Commit the changes with a clear message.
2. Push as `AGENTS.md` section 10 says.
3. Tell the user the Worker name that you chose.
4. Tell the user to do the Cloudflare steps in section 11 of `AGENTS.md`, if the site is not deployed yet.
5. Tell the user to check the build in the Cloudflare dashboard.
6. Tell the user to add the final site address to `public/llms.txt` when they know it.
