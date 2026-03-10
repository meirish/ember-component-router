import Component from '@glimmer/component';
import { getOwner } from '@ember/owner';
import type Owner from '@ember/owner';
import type { ComponentLike } from '@glint/template';
import { getOrCreateContext } from '../router-context.ts';
import type { RouterContext } from '../router-context.ts';

type RouteComponentLike = ComponentLike<{
  Args: { Named: Record<string, unknown> };
}>;

export interface OutletSignature {
  Args: Record<string, never>;
  Element: HTMLDivElement;
}

export default class Outlet extends Component<OutletSignature> {
  readonly #context: RouterContext;
  readonly #depth: number;

  constructor(owner: Owner, args: OutletSignature['Args']) {
    super(owner, args);
    this.#context = getOrCreateContext(getOwner(this)!);
    this.#depth = this.#context.claimOutletDepth();
  }

  get #level() {
    return this.#context.levels[this.#depth];
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
    {{#if this.currentComponent}}
      {{component this.currentComponent loaderData=this.loaderData params=this.params}}
    {{/if}}
  </template>
}
