# ember-component-router

This addon provides a way to define route patterns that then map to given components. 

It also provides a <RoutePortal @map={{routeMap}} @base="/" /> that takes a RouteMap as an argument and renders a tree of components based off of the RouteMaps active routes.

We use @remix-run/route-pattern to match the URL to active routes, and the Navigation API respond to URL changes.


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
