# Personalizing this fork

This repository is a fork of `primeinc/github-stars`. The committed data
(`web/public/data.json`, `repos.yml`) still reflects the **upstream** account's
stars (`manifest_metadata.github_user: primeinc`, ~2,085 repos). Nothing in the
*code* is upstream-specific — the pipeline keys off the repo owner and the token
you provide — so personalizing is an operational, one-time setup.

## Why no code change is needed

- `01-fetch-stars.yml` fetches `viewer.starredRepositories` via GraphQL using
  `secrets.STARS_TOKEN` (falling back to `GITHUB_TOKEN`). **`viewer` is whoever owns
  the token** — so the stars that get pulled are the token owner's.
- `02-sync-stars.yml` sets `manifest_metadata.github_user = context.repo.owner`, i.e.
  `4444J99` once it runs in this fork.

So the first real pipeline run under your account replaces the upstream data
automatically.

## Steps

1. **Create a token.** On the `4444j99` account, create a classic Personal Access
   Token with the `read:user` and `public_repo` scopes (no write access needed).
2. **Add the secret.** In this repo: *Settings → Secrets and variables → Actions →
   New repository secret* → name `STARS_TOKEN`, value = the PAT.
   *(This is the one step that can't be automated — secrets can't be set via API by an
   agent.)*
3. **Run the pipeline in order** (Actions tab → *Run workflow*):
   1. `01-Fetch GitHub Stars` — pulls your stars to
      `.github-stars/data/fetched-stars-graphql.json`.
   2. `02-Sync Stars` — merges into `repos.yml`, sets `github_user` to `4444J99`.
   3. `03-Classify Repos` — AI-classifies new repos into the taxonomy.
   4. `04-Build and Deploy Site` and `05-Generate READMEs` — rebuild the site +
      Markdown indexes. (These also run automatically off the earlier steps.)

After step 3, `repos.yml` / `data.json` carry **your** stars and
`github_user: 4444J99`.

## Verifying

- `npm run validate` — taxonomy check passes.
- `grep github_user web/public/data.json` → `4444J99` (was `primeinc`).
- The deployed site at `https://4444j99.github.io/github-stars/` shows your stars.

## Token expiry

If a run fails with `Bad credentials`, the `STARS_TOKEN` PAT expired — generate a new
one and update the secret (the fetch workflow surfaces this message explicitly).
