# CLAUDE.md — HomeReady Helpers Website

Project instructions for Claude Code sessions working in this repo
(`homereadyhelpers/homereadyhelpers.github.io`).

## Obsidian vault sync (Google Drive)

The client keeps a project vault in Obsidian, synced to a Google Drive
folder named **"HomeReady Helpers Vault"**. This repo's work is tracked
there as a set of linked Markdown notes.

**At the start of every session working in this repo:**
1. Use the connected Google Drive tools to find the **"HomeReady Helpers
   Vault"** folder and read through its notes before starting any work.
2. Use that context — prior decisions, pending TODOs, known limitations —
   to inform the session instead of re-deriving it from scratch or asking
   the client to repeat themselves.
3. If the folder can't be found (Google Drive not connected this session,
   folder renamed/moved, etc.), say so plainly to the client rather than
   proceeding as if no prior work exists.

**At the end of any session where something changed** (code, config,
a decision made, a dashboard setting configured outside this repo, etc.):
1. Write a new note, or update an existing one, in the same vault folder
   summarizing: what changed, why, which files/settings were touched, and
   what — if anything — is still pending.
2. Match the style already established in the vault: YAML frontmatter
   (`title`, `project`, `tags`, `created`, `status`), `[[wikilinks]]` to
   related notes, and a `status` of `current`, `superseded`,
   `pending-client-action`, etc.
3. Tell the client in chat that the vault was updated, and with which note.

Don't skip this because a change feels small — the point of the vault is
that nothing gets lost between sessions.

## Working agreement

- **Never push directly to `main`.** `main` is the live site
  (`homereadyhelpers.com`). All work happens on a feature branch
  (currently `claude/service-booking-calendar-mqsq5g`). Nothing goes to
  `main` without the client explicitly asking for it.
- **Show it before it ships.** Any visible/functional change gets shown
  as a working preview (an Artifact and/or screenshots) before it's
  pushed anywhere the client would consider "live" — this applies even
  on the feature branch.
- **Don't rebuild what already exists.** Before building custom logic for
  something a real tool likely already handles (scheduling, payments,
  forms, etc.), ask whether the client already has an account/tool for
  that.
- **Match the existing design system.** `style.css` defines the brand:
  black background, green `#4EA345`/`#6BD05D` accents, white text, grey
  `#b0afa9` secondary text, sharp 2px-radius corners, `Arial Black`-style
  display headings. Reuse existing tokens and component patterns
  (`.btn`, `.tag`, `.section-title`, card styles) rather than inventing a
  new visual language.
- **Be upfront about limitations.** If something can't be fully
  automated (e.g. Calendly's public API not exposing buffer/padding
  settings), say so plainly and give exact manual steps rather than
  pretending it's handled.
- **Attribution:** commits end with a `Co-Authored-By: Claude Sonnet 5
  <noreply@anthropic.com>` trailer and session link, per standing
  session instructions.
