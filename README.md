# ember-component-router

A V2 Ember addon that maps URL patterns to components using the browser's [Navigation API](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API). Route definitions are plain objects — no Ember route classes or router.js config required.

## How it works

`<RoutePortal>` creates a `Router` instance that listens to `window.navigation` for URL changes. When a URL matches a route, the router dynamically imports the route's module and renders its default export as a component using Glimmer's `{{component}}` helper. Layouts wrap child routes via `<Outlet>`, which each claim a depth slot from a shared context keyed by the Ember owner.

Route patterns are matched using [`@remix-run/route-pattern`](https://github.com/remix-run/remix/tree/main/packages/route-pattern).

## Requirements

- Ember.js v5.8+
- Embroider (V2 addon format)
- A browser with the Navigation API (`window.navigation`) — Chrome 102+

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
export async function loader({ params, request }) {
  const user = await fetchUser(params.id);
  return user;
}

export default <template>
  <h2>{{@loaderData.name}}</h2>
</template>;
```

### `action`

Export an `action` function to handle form submissions (Navigation API `formData` events). After the action runs, the route re-renders via the loader.

```ts
export async function action({ params, request }) {
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

[MIT](LICENSE.md)
