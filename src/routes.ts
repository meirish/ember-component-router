import type { RouteDefinition, ModuleFactory } from './types.ts';

export function route(
  pattern: string,
  moduleFactory: ModuleFactory,
  children?: RouteDefinition[]
): RouteDefinition {
  return { _type: 'route', pattern, moduleFactory, children };
}

export function index(moduleFactory: ModuleFactory): RouteDefinition {
  return { _type: 'index', pattern: '', moduleFactory };
}

export function layout(
  moduleFactory: ModuleFactory,
  children: RouteDefinition[]
): RouteDefinition {
  return { _type: 'layout', pattern: '', moduleFactory, children };
}

export function prefix(
  prefixPattern: string,
  children: RouteDefinition[]
): RouteDefinition[] {
  return children.map((child) => prependPattern(prefixPattern, child));
}

function prependPattern(pfx: string, def: RouteDefinition): RouteDefinition {
  if (def._type === 'index') {
    return { ...def, pattern: pfx };
  }
  return {
    ...def,
    pattern: def.pattern ? `${pfx}/${def.pattern}` : pfx,
  };
}
