<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## OmaTahti architecture rules
- Frontend-only prototype: all data lives in one localStorage store (`src/services/storage.ts`) read by both roles, so role views never diverge; replace this module to add a backend.
- Route files in `src/routes` stay thin and render components from `src/pages`; `__root.tsx` is the composition layer (no App.tsx), because TanStack Router is fixed by the template.
- Programs and exercises are pure data in `src/data`; new body areas/programs are added there without UI changes.
- Demo seed data is built lazily with dates relative to today (never at module scope) so the demo stays current and Workers SSR stays safe.
- Only completed sessions count toward completions and streaks (`src/utils/progress.ts`); interrupted sessions never count.
- Role sections are guarded by `RoleLayout`; a mismatched role redirects to `/`.
- Feature logic lives in `src/features/<feature>` with pure rules in `*Logic.ts` (tested), and store writes in `src/services/<feature>.ts`, so UI stays thin and rules are testable.
- Intake answers autosave to `client.intakeDraft` on every change and move to `client.intake` only on save; body-area-specific intake options live in `src/data/intake.ts`.
