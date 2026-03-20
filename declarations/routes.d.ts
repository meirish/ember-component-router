import type { RouteDefinition, ModuleFactory } from './types.ts';
export declare function route(pattern: string, moduleFactory: ModuleFactory, children?: RouteDefinition[]): RouteDefinition;
export declare function index(moduleFactory: ModuleFactory): RouteDefinition;
export declare function layout(moduleFactory: ModuleFactory, children: RouteDefinition[]): RouteDefinition;
export declare function prefix(prefixPattern: string, children: RouteDefinition[]): RouteDefinition[];
//# sourceMappingURL=routes.d.ts.map