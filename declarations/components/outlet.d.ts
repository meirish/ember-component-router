import Component from '@glimmer/component';
import type Owner from '@ember/owner';
import type { ComponentLike } from '@glint/template';
type RouteComponentLike = ComponentLike<{
    Args: {
        Named: Record<string, unknown>;
    };
}>;
export interface OutletSignature {
    Args: Record<string, never>;
    Element: HTMLDivElement;
}
export default class Outlet extends Component<OutletSignature> {
    #private;
    constructor(owner: Owner, args: OutletSignature['Args']);
    get currentComponent(): RouteComponentLike | null;
    get loaderData(): unknown;
    get params(): Record<string, string | undefined>;
    get queryParams(): URLSearchParams;
}
export {};
//# sourceMappingURL=outlet.d.ts.map