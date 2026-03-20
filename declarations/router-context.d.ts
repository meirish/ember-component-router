import type { RouteLevel } from './types.ts';
export declare class RouterContext {
    #private;
    levels: RouteLevel[];
    claimOutletDepth(): number;
    resetOutletDepth(): void;
}
export declare function getOrCreateContext(owner: object): RouterContext;
//# sourceMappingURL=router-context.d.ts.map