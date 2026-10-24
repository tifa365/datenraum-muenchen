# CIVORA UI: how it is built and what it does

An explainer for developers who want to run, customise or strip down this code base. It was
written against release 1.30.0 (package name still `dksr-ui`). Everything here is derived from the
source; `path:line` references point into this repository. The [README](../README.md) covers
configuration knobs, install/run, CI and testing commands and is not repeated here.

## 1. In one paragraph

CIVORA UI is a Vue 3 + TypeScript single-page application built with Vite. It is a **shell around
external services**: Keycloak for login, a Piveau hub (search, repo, store) for the DCAT data
catalogue, Apache Superset for dashboards, and a handful of DKSR tools (alerts, connectors, Airflow,
Matomo, ThingsBoard, a "model coordinator") that are either embedded as iframes or merely linked
from an admin page. The app itself contains little business logic; most of its code is UI
components, config plumbing, and glue that passes Keycloak tokens to those services.

## 2. Build and configuration pipeline

**Toolchain.** pnpm 10 (`package.json:7`), Node 20 implied by `@tsconfig/node20`, Vite 5,
TypeScript 5.3, `vue-tsc` for type checking. `pnpm build` runs type-check and `vite build` in
parallel; `pnpm build-with-piveau` is the same without type-check and is the documented production
build. Vitest (jsdom) and Playwright are configured, Histoire builds component stories.

**Vite plugins** (`vite.config.ts`): `@vitejs/plugin-vue`, `unplugin-vue-components` (auto-registers
every `**/components/**/*.vue`), `unplugin-icons` with Iconify sets, and `vite-plugin-static-copy`,
which copies `src/assets/{icons,images}` and the tarteaucitron cookie-consent library into `dist/`.
Aliases: `@` → `src`, `@config` → `config`. No proxy, no custom chunking, base path `/`.

**Configuration is a two-stage string substitution, not a runtime fetch.**

1. `config/config.js` exports an object whose every value is a literal placeholder such as
   `'$VITE_API_BASE_URL'`. Production builds bundle it unchanged. Dev builds use
   `config/config.dev.js` instead (`config/appConfig.ts:28-37`), which `change-project.sh`
   generates by copying `config/<customer>/config.js`.
2. At container start `runtimeconfig.sh` sources `/default.env` (defaults for every `VITE_*`
   variable, overridable by the environment), runs `envsubst` over `dist/assets/index-*.js` and
   `index.html`, copies the customer favicon, and starts nginx.

Consequences: **all config values are strings**, so the code compares `=== 'true'` everywhere; the
whole configuration is readable from the public bundle; and the container image must contain
`config/<customer>/` assets, which the repo's Vite config does not copy (presumably the missing
Dockerfile does).

**Customer mechanism.** `appConfig.customer.name` selects, at runtime by URL path,
`/config/<name>/assets/style.css` (CSS variable overrides), logos and header images. At build time
`import.meta.glob` pulls in **every** customer's `locale-overrides/*.json`,
`components/data-notices/*.vue` and home views (`src/i18n.js:52`, `src/utils/dataNoticePages.ts:39`,
`src/views/app/HomeView.vue:31-51`), so a production bundle ships all customers' content.

**What the public repo is missing.** `config/config.dev.js`, `config/userConfigShimPlugin`
(imported by `src/main.ts:45`), every `config/<customer>/` folder, `tests/`, `.gitignore`, ESLint
and Prettier configs, Dockerfile, `.gitlab-ci.yml`, Helm chart. A clean checkout therefore does not
build until you create `config/config.dev.js` and a `userConfigShimPlugin` that provides
`$env.api.hubUrl` and `$env.content.dataProviderInterface.*` (see
`src/projects/data-provider-interface/composables/useRuntimeEnv.ts`).

**Styling.** Tailwind 3 with CSS-variable colour tokens defined in
`src/projects/kdw/assets/base.css` and mapped in `tailwind.config.js:68-119`; PrimeVue 3 in unstyled
mode with a Tailwind pass-through preset (`src/projects/kdw/components/base/preset`); Bootstrap 4,
Sass and jQuery only inside the data-provider-interface; Inter variable font.

## 3. Application shell

**Bootstrap** (`src/main.ts`): CSS imports → document title → customer style link → `createApp` →
Pinia → `useAuthStore().init(keycloakOptions)`. Nothing else is registered and the app is not
mounted until Keycloak's `check-sso` resolves. Then, in order: `userConfigShimPlugin`, a Vuex store
(for the DPI), FormKit, router, TanStack Query, `@piveau/sdk-vue`, PrimeVue, i18n, piveau DPI
components, `mount`.

**Authentication** (`src/stores/authStore.ts`): keycloak-js with `check-sso`,
`silent-check-sso.html`, login-status iframe, proactive refresh at 70 % of token lifetime. The
store additionally fetches a **UMA RPT** (`grant_type=urn:ietf:params:oauth:grant-type:uma-ticket`,
`audience=keycloakPiveauClientId`) every 5 minutes; its `authorization.permissions` drive
dataset-level access control. There is no HTTP interceptor: every service call adds
`Authorization: Bearer` explicitly. The Pinia store is bridged into the Vuex DPI store by
`useAuthToDpiBridge`.

**Authorisation** has two layers. Keycloak **group membership** (`/Administrator`,
`/Super-Administrator`, `/Civora Alerts/*`, `/Airflow/*`, …) gates the admin cockpit cards and
user-menu items (`src/composables/useAdminCards.ts`). RPT **scopes**
(`dataset:view_draft|view_published|create|update|publish|delete`, `catalog:view|create|update|delete`
on resources named `org/catalog/dataset`) gate catalogue actions when
`customer.enableDataSetLevelAccessControl` is on (`src/composables/useAccessPermissions.ts`).

**Routing** (`src/router/routes.ts`): a public tree (`/`, `/data-catalog`, `/data-notices`,
`/info`) mounted only when `landingPagePublic === 'true'`; the `/app/*` tree where each module
route takes `requiresAuth` from `modules.<x>.requiresLogin` and `accessible` from
`modules.<x>.available`; `/app/admin-cockpit`; the analytics routes; up to three configurable
iframe modules; and the DPI routes `/dpi`, `/civora-dpi`. Guards (`src/router/index.ts`) redirect
inaccessible routes to `/app/home` and send unauthenticated users to Keycloak login. The sidebar is
built from the same module config by `useSidebarModules`.

**Two layouts.** `customer.useNewCivoraUi` switches between the legacy `city-os` components
(`COS*`, i18n namespace `city-os.*`) and the new `civora-ui` components (`CIV*`). Several views
fork on the same flag internally. The K-prefixed components under `src/projects/kdw` are the older
design-system layer that the `CIV*` components are replacing.

**State.** Pinia only holds the auth store. Vuex 4 exists solely because the Piveau DPI package
ships a Vuex module. `pinia-plugin-persistedstate` is installed but no store persists anything;
the only browser storage is `localStorage.locale` and the tarteaucitron consent cookie.

**i18n.** vue-i18n without a fallback locale. Supported locales come from
`languages.displayOptions`; messages are loaded lazily per locale and deep-merged with the
customer's `locale-overrides`. Base files: `src/locales/{de,en,cs}.json`.

**Extension points for a customer.** Per-customer home view for logged-out users, legal pages
(`data-notices/*.vue`), info-page tabs (`app-info/index.ts`), locale overrides, `style.css`, header
links and user-menu entries from config, three custom iframe modules, and the **plugin protocol**
(`usePluginIntegration`): an embedded iframe posts `GET_CIVORA_CONTEXT` and receives
`{ user: {id, token}, tenant: {id}, locale }`, re-sent on every token refresh.

**Cookie consent.** tarteaucitron is loaded headlessly; the Vue components
`CIVCookieConsent{Manager,Banner,Dialog}` render the UI. The only service is "usage analytics",
which exists when `trackingEmbedCode` is configured. Router navigation dispatches a
`vue-router-navigated` window event for SPA page-view tracking.

## 4. Feature modules

| Module | Entry | Backend | How |
|---|---|---|---|
| Home | `views/app/HomeView.vue` | `middlewareUrl/news` | widgets list from `modules.home.widgets`: `news`, `orgnews`, `dashboard <id>`, `iframe <url>` |
| Data catalogue | `projects/kdw/views/DatasetSearchView.vue`, `DatasetDetailsView.vue` | Piveau hub-search `/search` via `@piveau/sdk-vue` `createUseResourceSearch` | facets, route-synced query state, Bearer token when ACL is on |
| Organisation data | `views/app/OrganisationDataView.vue` | hub-search, hub-repo `drafts/datasets/*`, JSON-RPC `action` endpoint, `DELETE datasets/{id}` | drafts, publish/hide, delete, RDF downloads with `Accept` negotiation |
| Data preview | `CIVDataPreview*.vue` | `piveauPreviewUrl/dataPreview` or `middlewareUrl/datasetPreview/{eventType}` | AG Grid table and Chart.js charts |
| Data Provider Interface | `/dpi` → `KDWDataProviderInterface.vue`; `/civora-dpi` → iframe | hub-repo `PUT datasets`, drafts, `identifiers`, hub-store upload | FormKit multi-step editor **from the npm package `@piveau/piveau-hub-ui-modules`**; the vendored copy under `src/projects/data-provider-interface` is mostly dead code (only its Vuex auth/snackbar stores, one custom input and `DataFetchingComponent` are used) |
| Dashboards | `views/app/Dashboards{,View}.vue` | Superset REST `/api/v1/dashboard`, `/embedded`, `/security/guest_token/`, screenshot endpoints | `@superset-ui/embedded-sdk`; Superset must accept Keycloak JWTs; the guest token is requested from the browser |
| Digital twin / custom iframes | `views/app/CIVIframeView.vue` | any URL (`digitalTwinUrl`, `customIframeModule*.url`) | plain iframe, optional authenticated URL, optional plugin handshake; no 3D code in this repo |
| DKSR apps | `views/app/DKSRApp{s,}View.vue` | static list of external app URLs (`useDataAnalyticsWidgets.ts`) | iframes, toggled per app in config |
| Analytics | `src/modules/civora-analytics/*` | `modelCoordinatorUrl/api/processes`, `/execution`, `/jobs/{id}`, `/results` (OGC API Processes style, no auth header) | process inputs schema rendered with JSON Forms (`CIVJsonForm` + custom renderers), job polling |
| Admin cockpit | `views/admin/AdminView.vue` | none | link-out cards to Keycloak console, alerts, connectors, Airflow, Matomo, ThingsBoard, filtered by group |
| Organisation sites | `components/organisation-sites/*` | hub-search catalogues, `middlewareUrl/orgMembers` | publisher pages |
| Data exchange | `components/data-exchange/*` | none | static mock table |

## 5. Known dead or inconsistent code (useful when simplifying)

- Unused: `views/dormant/*` (mock login/registration), `views/app/DigitalTwinView.vue`,
  `CustomIframeView` import, both `useRptManager.ts` copies, `useDatasetStatistics.ts`,
  `superset.ts#searchDashboards`, `@superset-ui/switchboard`, most of
  `src/projects/data-provider-interface/**`, several `city-os` and header components.
- Duplicate dataset SDK wrappers: `src/composables/useDatasetsSearch.ts` vs
  `src/projects/kdw/sdk/index.ts` (one takes a base URL, the other is hard-wired).
- Key mismatches between code and config: `languages.fallbackLocale` (code) vs
  `languages.fallbackLanguage` (config); `customer.metaTitle/metaDescription` and `piveauApiKey`
  are read but not defined in `config/config.js`.
- `pnpm lint` points at a `.gitignore` that does not exist; Vitest looks for `tests/**`, which does
  not exist, so there are zero unit tests. The single Playwright spec covers cookie consent.
- The `pv-sdk` submodule scripts are leftovers; the SDK now comes from npm (`@piveau/sdk-*` alpha.10).

## 6. Minimal viable subset

To run a stripped-down data hub you need: `src/main.ts`, the auth store, router, i18n, one layout
(`civora-ui`), `HomeView` with the news widget, the KDW dataset search/detail views with the Piveau
SDK, and `CIVIframeView` for any embedded app. Everything in the table above is independently
switchable through `customer.modules.*`, so the first simplification step is config, not code.

See also [docs/reverse-engineering/augsburg](reverse-engineering/augsburg/README.md) for a worked
example of a real deployment, including its full resolved configuration.
