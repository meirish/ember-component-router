import Component from '@glimmer/component';
import type Owner from '@ember/owner';
import type { ComponentLike } from '@glint/template';
import type { RouteDefinition } from '../types.ts';
type RouteComponentLike = ComponentLike<{
    Args: {
        Named: Record<string, unknown>;
    };
}>;
export interface RoutePortalSignature {
    Args: {
        config: RouteDefinition[];
        base?: string;
    };
    Element: HTMLDivElement;
}
export default class RoutePortal extends Component<RoutePortalSignature> {
    #private;
    constructor(owner: Owner, args: RoutePortalSignature['Args']);
    willDestroy(): void;
    get currentComponent(): RouteComponentLike | null;
    get loaderData(): unknown;
    get params(): Record<string, string | undefined>;
    get queryParams(): URLSearchParams;
}
export {};
//# sourceMappingURL=route-portal.d.ts.map