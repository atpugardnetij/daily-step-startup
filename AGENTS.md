<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep dashboard and insights calculations in the browser-safe `src/lib/dashboard.ts` module, derived from the existing plan store, so both pages agree without changing saved data.
- Keep daily actions on `/dashboard` and read-only secondary statistics and scheduled-day history on `/insights`; history is not a completion-time audit log because tasks do not store completion timestamps.
