# ember-component-router

This addon provides a way to define route patterns that render a tree of components into your app based on the current URL.

This id done by using the built in RouterPortal component and RouteConfig class. RoutePortal is used like this in your app: <RoutePortal @config={{routeConfig}} @base="/" /> that takes a RouteConfig as an argument. Each RoutePortal has its own instance of a Router that uses the browser's Navigation API to track what routes from the RouteConfig are active, and to render the component specified in the active route's module.

We use @remix-run/route-pattern to match the URL to active routes, and the Navigation API respond to URL changes.


## Defining Routes

A RouteConfig maps URLPatterns to their corresponding route modules. This is very similar to React Router's framework mode:

```
import {
  route,
} from "ember-component-router/routes";

export default [
  route("some/path", "./some/file.tsx"),
  // pattern ^           ^ module file
];
```


The RouteConfig gets passed to a RoutePortal which then creates an instance of a Router. The Router's active routes then trigger calls to Ember's `renderComponent` using the RoutePortal's element as its target for the `into` param. The Router has a [Matcher](https://github.com/remix-run/remix/tree/main/packages/route-pattern#matchers) that contains all of the routes defined in the RouteConfig. The `route` helper in the RouteConfig registers the URLPattern with Router's matcher. The default matcher is the array matcher, but this can be overriden. When a route is active, it's module is imported using dynamic `import` and it's Component is added to the tree to render.

## Route modules
The default export of a route module should be the component class.

## Compatibility

- Ember.js v5.8 or above
- Embroider or ember-auto-import v2

## Installation

```
ember install ember-component-router
```

## Usage

[Longer description of how to use the addon in apps.]

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).
