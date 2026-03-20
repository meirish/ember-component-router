function route(pattern, moduleFactory, children) {
  return {
    _type: 'route',
    pattern,
    moduleFactory,
    children
  };
}
function index(moduleFactory) {
  return {
    _type: 'index',
    pattern: '',
    moduleFactory
  };
}
function layout(moduleFactory, children) {
  return {
    _type: 'layout',
    pattern: '',
    moduleFactory,
    children
  };
}
function prefix(prefixPattern, children) {
  return children.map(child => prependPattern(prefixPattern, child));
}
function prependPattern(pfx, def) {
  if (def._type === 'index') {
    return {
      ...def,
      pattern: pfx
    };
  }
  return {
    ...def,
    pattern: def.pattern ? `${pfx}/${def.pattern}` : pfx
  };
}

export { index, layout, prefix, route };
//# sourceMappingURL=routes.js.map
