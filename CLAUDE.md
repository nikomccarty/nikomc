# CLAUDE.md — nikomc.com

## About this project

Static HTML/CSS/JS personal site for Niko McCarty — writer on biology. No build system, no framework, no package manager. All pages are hand-edited HTML. Hosted on GitHub Pages via `https://github.com/nikomccarty/nikomc.git` (HTTPS remote; Claude cannot push without user credentials).

## Stack — always use these, never suggest alternatives

- **Language:** Vanilla HTML, CSS, JavaScript (no TypeScript, no bundler)
- **Styling:** Single stylesheet at `css/style.css`
- **JS:** Single script at `js/main.js`
- **Hosting:** GitHub Pages (static only — no server-side logic)
- **Git remote:** HTTPS — user must run `git push` themselves unless credentials are available in the session

## Site structure

- `essays/` — long-form essays and shortform posts (same folder, different `post-tag` meta)
- `manifesto/` — "Big Ideas" individual pages
- `drafts/` — hidden work-in-progress files (not linked from any listing)
- `images/essays/` — essay images, organized by slug subfolder
- `css/style.css` — all styles; sidenote, link-card, and responsive rules are here
- `js/main.js` — theme toggle, mobile sidenotes, homepage post aggregation, search

## Key conventions

**Publishing an essay:**
1. Set `<meta name="post-tag" content="essay|shortform">` in the file
2. Set the matching `class="active"` nav link (`essays.html` or `shortform.html`)
3. Add `<a href="../essays.html" class="back-link">` (or shortform)
4. Add a `<li>` entry to the appropriate listing page (`essays.html` or `shortform.html`)
5. Homepage (`index.html`) auto-populates via `main.js` fetching both listing pages

**Hiding an essay:** Remove the listing entry and the back-link. File remains accessible by direct URL.

**Sidenotes:** Use `<label for="sn-N" class="sn-toggle">` + `<input type="checkbox" id="sn-N" class="sn-checkbox">` + `<span class="sidenote">` inside the relevant `<p>`. CSS auto-numbers via `counter-increment: sidenote-counter`. Number IDs in document order (sn-1 = first appearance, etc.). Mobile footer is built by `main.js`.

**Encoding:** Always use HTML entities for curly quotes (`&#8220;` `&#8221;` `&#8217;`), em dashes (`&mdash;`), and degree symbols (`&#176;`).

## Communication defaults

- Start every response with the actual answer. No filler phrases ("Great!", "Of course!", "Certainly!").
- Match length to complexity. Short questions get short answers. No padding or closing restatements.
- For significant tasks, show 2–3 approaches and wait for a choice before proceeding.
- If uncertain about any fact, say so explicitly before including it. Never fill gaps with plausible-sounding information.

## Behavior rules

- **Only touch files directly related to the current task.** Do not refactor, rename, or "improve" anything not explicitly requested. If something elsewhere is worth fixing, mention it in a note — do not touch it.
- **Before significantly altering existing content** (rewriting sections, removing paragraphs, restructuring): stop, describe what will change and why, wait for confirmation.
- **Before deleting files, overwriting code, or removing dependencies:** list exactly what will be affected and ask for explicit confirmation. Only proceed after a yes in the current message.
- **Deploying/pushing, external API calls, and irreversible commands** require explicit in-session confirmation. "You mentioned this earlier" is not confirmation.
- **Never send, post, publish, or share anything** (emails, social posts, etc.) without explicit confirmation in the current message.
- After coding tasks, end with: files changed / what was modified / files intentionally not touched / follow-up needed.

## Karpathy's 4 rules

1. **Ask, don't assume.** If something is unclear, ask before writing a single line. Never make silent assumptions about intent, architecture, or requirements.
2. **Simplest solution first.** Always implement the simplest thing that could work. Do not add abstractions or flexibility that weren't explicitly requested.
3. **Don't touch unrelated code.** If a file or function is not directly part of the current task, do not modify it — even if it could be improved.
4. **Flag uncertainty explicitly.** If not confident about an approach or technical detail, say so before proceeding. Confidence without certainty causes more damage than admitting a gap.
