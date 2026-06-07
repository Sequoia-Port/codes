# Publishing `@sequoiaport/codes`

Two paths, set up so you never run `npm login` again:

- **CI (recommended, tokenless):** push a version tag → GitHub Actions publishes via npm **OIDC Trusted Publishing**. No token is stored anywhere.
- **Local (ad-hoc):** a long-lived granular **automation token** in `~/.npmrc` so `npm publish` from your machine just works.

---

## A. CI auto-publish (OIDC Trusted Publishing) — one-time setup

The workflow already exists: `.github/workflows/publish.yml`. You only do the npm side once.

1. **Land the workflow on `main`.** Trusted Publishing matches on `owner/repo` + workflow filename, and tag-triggered runs read the workflow from the tagged commit, so make sure `.github/workflows/publish.yml` is merged to `main` (and present on whatever branch you tag from).

2. **Configure the trusted publisher on npm (the only manual step):**
   - Go to <https://www.npmjs.com/package/@sequoiaport/codes/access> → **Trusted Publisher** (a.k.a. "Publishing access").
   - Add a **GitHub Actions** publisher:
     - Organization / repository: `Sequoia-Port/codes`
     - Workflow filename: `publish.yml`
     - Environment: *(leave blank unless you add a GitHub Environment)*
   - Save. (Requires npm 2FA on your account to configure; nothing to store afterward.)

3. **Publish from then on — just tag:**
   ```bash
   # bump the version first (edit package.json or):
   npm version 0.1.7-beta.0 --no-git-tag-version
   git commit -am "release: v0.1.7-beta.0"
   git tag v0.1.7-beta.0
   git push && git push origin v0.1.7-beta.0
   ```
   GitHub Actions builds and publishes automatically. Pre-release versions
   (anything with a hyphen, e.g. `-beta.0`) go to the **`beta`** dist-tag;
   clean semver goes to **`latest`**. Each publish also gets a **provenance**
   attestation (supply-chain signature) for free, since CI uses OIDC.

   You can also trigger a publish manually from the **Actions** tab
   (`workflow_dispatch`) without a tag — it publishes the current
   `package.json` version.

> Why this kills the manual login: OIDC mints a **short-lived** credential per
> run and exchanges it with npm. There is no token to create, store, rotate, or
> let expire — the failure mode you kept hitting.

---

## B. Local publishing (long-lived automation token) — one-time setup

Use this when you want to publish from your laptop. It fixes the recurring
`E401 / E404-on-publish` (your current `~/.npmrc` token is expired or read-only).

1. **Generate a token on npm:**
   - <https://www.npmjs.com/settings/~/tokens> → **Generate New Token** →
     **Granular Access Token** (preferred) or classic **Automation**.
   - **Packages and scopes:** Read **and write**, scoped to `@sequoiaport/*`.
   - **Expiration:** the max allowed (or as long as policy permits). Granular
     tokens can't be truly "never expire", so calendar a rotation; the CI/OIDC
     path (A) is the no-expiry option.
   - Copy the `npm_…` value.

2. **Put it in `~/.npmrc`** (replace the existing stale line):
   ```ini
   @sequoiaport:registry=https://registry.npmjs.org/
   //registry.npmjs.org/:_authToken=npm_xxxxxxxxxxxxxxxxxxxx
   ```
   (Your `~/.npmrc` already has these two lines — just swap the token value.)

3. **Verify + publish:**
   ```bash
   npm whoami                                   # should print your npm user
   cd codes
   npm version 0.1.7-beta.0 --no-git-tag-version
   npm run build
   npm publish --tag beta --access public       # omit --tag for a `latest` release
   ```

> Security note: a long-lived token on disk is a real credential — anyone with
> your `~/.npmrc` can publish. Keep it scoped to `@sequoiaport` write-only, and
> prefer the CI/OIDC path for routine releases.

---

## dist-tag cheatsheet
- `*-beta.*`, `*-rc.*`, any hyphenated pre-release → publish with `--tag beta` (CI does this automatically).
- clean `x.y.z` → publish with no `--tag` (defaults to `latest`).
- Promote a beta to latest later: `npm dist-tag add @sequoiaport/codes@0.1.7 latest`.
