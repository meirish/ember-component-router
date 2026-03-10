import Component from '@glimmer/component';
import { getOwner } from '@ember/owner';
import type Owner from '@ember/owner';
import type { ComponentLike } from '@glint/template';
import { Router } from '../router.ts';
import { getOrCreateContext } from '../router-context.ts';
import type { RouterContext } from '../router-context.ts';
import type { RouteDefinition } from '../types.ts';

type RouteComponentLike = ComponentLike<{
  Args: { Named: Record<string, unknown> };
}>;

export interface RoutePortalSignature {
  Args: {
    config: RouteDefinition[];
    base?: string;
  };
  Element: HTMLDivElement;
}

export default class RoutePortal extends Component<RoutePortalSignature> {
  readonly #context: RouterContext;
  readonly #router: Router;

  constructor(owner: Owner, args: RoutePortalSignature['Args']) {
    super(owner, args);
    this.#context = getOrCreateContext(getOwner(this)!);
    this.#router = new Router(
      args.config,
      args.base ?? '/',
      (levels) => {
        this.#context.levels = levels;
        this.#context.resetOutletDepth();
      }
    );
  }

  willDestroy(): void {
    super.willDestroy();
    this.#router.destroy();
  }

  get #level() {
    return this.#context.levels[0];
  }

  get currentComponent(): RouteComponentLike | null {
    return (this.#level?.component as RouteComponentLike) ?? null;
  }

  get loaderData(): unknown {
    return this.#level?.loaderData;
  }

  get params(): Record<string, string | undefined> {
    return this.#level?.params ?? {};
  }

  <template>
    <div data-route-portal>
      {{#if this.currentComponent}}
        {{component this.currentComponent loaderData=this.loaderData params=this.params}}
      {{/if}}
    </div>
  </template>
}
