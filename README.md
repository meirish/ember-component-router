# ember-component-router

A V2 Ember addon that maps URL patterns to components using the browser's [Navigation API](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API). Route definitions are plain objects — no Ember route classes or router.js config required.

## How it works

`<RoutePortal>` creates a `Router` instance that listens to `window.navigation` for URL changes. When a URL matches a route, the router dynamically imports the route's module and renders its default export as a component using Glimmer's `{{component}}` helper. Layouts wrap child routes via `<Outlet>`, which each claim a depth slot from a shared context keyed by the Ember owner.

Route patterns are matched using [`@remix-run/route-pattern`](https://github.com/remix-run/remix/tree/main/packages/route-pattern).

## Requirements

- Ember.js v5.8+
- Embroider (V2 addon format)
- A browser with the Navigation API (`window.navigation`)

## Installation

```sh
pnpm add ember-component-router
# or
npm install ember-component-router
```

## Basic usage

Define your routes in a config file:

```ts
// app/routes/config.ts
import { route, index } from 'ember-component-router/routes';

export default [
  index(() => import('./home')),
  route('about', () => import('./about')),
  route('users(/:id)', () => import('./user')),
  route('*', () => import('./not-found')),
];
```

Render them with `<RoutePortal>` in your application template:

```gts
import { RoutePortal } from 'ember-component-router';
import routeConfig from './routes/config';

<template>
  <RoutePortal @config={{routeConfig}} @base="/" />
</template>
```

## Using with Ember's router

`ember-component-router` uses the Navigation API to intercept browser routing, but if used in conjuction with Ember's router, pushstate and popstate events still fire on browser forward or back functionality. Additionally, loading on a page that directly routes via a pattern matched by `ember-component-router` will result in a `route not found` error. To work around both of these issues, you can define a catch-all route _in the Ember router_ that renders the same template defined in your template. This is akin to how when you set up an SPA for production, you tell servers to serve the same index.html file regardless of the path because the server isn't doing the routing - but in this case it's Ember's router that is ceding control to the Navigation API.

Yes, I know this isn't realistic for real-world apps (neither is using the Navigation API as the only means of routing), but it is a workaround that's useful for trying the addon out as a technical experiment. And Navigation API is part of [Interop 2026](https://wpt.fyi/results/navigation-api?label=master&label=experimental&aligned&view=interop&q=label%3Ainterop-2026-navigation), so broad support is hopefully on the horizon!


## Route modules

Each route module is a standard JS/TS module. The `default` export is the component to render.

```ts
// app/routes/home.gts
<template>
  <h1>Home</h1>
</template>
```

### `loader`

Export an async `loader` function to fetch data before the component renders. The result is passed as `@loaderData`.

```ts
export async function loader({ params, queryParams, request }: LoaderArgs) {
  const page = queryParams.get('page') ?? '1';
  const user = await fetchUser(params.id, page);
  return user;
}

export default <template>
  <h2>{{@loaderData.name}}</h2>
</template>;
```

### `action`

Export an `action` function to handle form submissions (Navigation API `formData` events). After the action runs, the route re-renders via the loader.

```ts
export async function action({ params, queryParams, request }: ActionArgs) {
  const data = await request.formData();
  await saveUser(data);
}
```

### `ErrorBoundary`

Export an `ErrorBoundary` component to catch loader or action errors. It receives the thrown value as `@loaderData`.

```ts
export const ErrorBoundary = <template>
  <p>Something went wrong: {{@loaderData.message}}</p>
</template>;
```

## Layouts and `<Outlet>`

Use `layout()` to wrap a group of routes in a shared layout component. The layout renders its children via `<Outlet>`.

```ts
// app/routes/config.ts
import { layout, index, route } from 'ember-component-router/routes';

export default [
  layout(() => import('../layouts/app'), [
    index(() => import('./home')),
    route('about', () => import('./about')),
  ]),
];
```

```gts
// app/layouts/app.gts
import { Outlet } from 'ember-component-router';

<template>
  <nav>...</nav>
  <main>
    <Outlet />
  </main>
</template>
```

Layouts can have their own `loader` — the result is passed as `@loaderData` to the layout component.

## Component args

All route components receive three named args from the router:

```ts
interface Signature {
  Args: {
    loaderData: unknown;           // return value of the route's loader
    params: Record<string, string | undefined>; // dynamic URL segments
    queryParams: URLSearchParams;  // parsed query string
  };
}
```

Access query params with the standard `URLSearchParams` API:

```ts
export default class MyRoute extends Component<Sig> {
  get page() {
    return this.args.queryParams.get('page') ?? '1';
  }
}
```

## Route helpers

All helpers are imported from `ember-component-router/routes`.

### `index(moduleFactory)`

Matches the base URL of the surrounding scope (or `@base` on the portal). No path segment.

```ts
index(() => import('./home'))
```

### `route(pattern, moduleFactory, children?)`

Matches a URL segment. Supports dynamic segments (`:id`) and optional segments (`(/:id)`). Can nest child routes.

```ts
route('users(/:id)', () => import('./user'))
route('posts', () => import('./posts'), [
  route(':slug', () => import('./post')),
])
```

### `layout(moduleFactory, children)`

Wraps children in a layout component. The layout must render `<Outlet>` to display the matched child. The layout node itself does not consume a URL segment.

### `prefix(prefixPattern, children)`

Prepends a path prefix to all children without introducing a layout. Returns a flat array.

```ts
prefix('admin', [
  index(() => import('./admin/dashboard')),
  route('users', () => import('./admin/users')),
])
```

## Multiple portals

You can mount multiple `<RoutePortal>` instances with different `@base` values. Each portal only responds to navigation events whose URL starts with its base.

```gts
<RoutePortal @config={{rootRoutes}} @base="/" />
<RoutePortal @config={{adminRoutes}} @base="/admin" />
```

## URL patterns

Patterns use the `@remix-run/route-pattern` syntax:

| Pattern | Matches |
|---|---|
| `about` | `/about` |
| `users/:id` | `/users/42` |
| `users(/:id)` | `/users` and `/users/42` |
| `*` | anything (wildcard) |

## License

This project is licensed under the [MIT License](LICENSE.md)
