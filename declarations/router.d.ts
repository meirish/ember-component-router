import type { RouteDefinition, ResolvedRoute, RouteLevel, ModuleFactory } from './types.ts';
export type OnMatchCallback = (levels: RouteLevel[]) => void;
export declare function flattenRoutes(definitions: RouteDefinition[], base: string, layoutChain?: ModuleFactory[]): ResolvedRoute[];
export declare class Router {
    #private;
    constructor(config: RouteDefinition[], base: string | undefined, onMatch: OnMatchCallback);
    destroy(): void;
}
//# sourceMappingURL=router.d.ts.map