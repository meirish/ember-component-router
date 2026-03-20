import Component from '@glimmer/component';
import { getOwner } from '@ember/owner';
import { Router } from '../router.js';
import { getOrCreateContext } from '../router-context.js';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';

class RoutePortal extends Component {
  #context;
  #router;
  constructor(owner, args) {
    super(owner, args);
    this.#context = getOrCreateContext(getOwner(this));
    this.#router = new Router(args.config, args.base ?? '/', levels => {
      this.#context.levels = levels;
      this.#context.resetOutletDepth();
    });
  }
  willDestroy() {
    super.willDestroy();
    this.#router.destroy();
  }
  get #level() {
    return this.#context.levels[0];
  }
  get currentComponent() {
    return this.#level?.component ?? null;
  }
  get loaderData() {
    return this.#level?.loaderData;
  }
  get params() {
    return this.#level?.params ?? {};
  }
  get queryParams() {
    return this.#level?.queryParams ?? new URLSearchParams();
  }
  static {
    setComponentTemplate(precompileTemplate("<div data-route-portal>\n  {{#if this.currentComponent}}\n    {{component this.currentComponent loaderData=this.loaderData params=this.params queryParams=this.queryParams}}\n  {{/if}}\n</div>", {
      strictMode: true
    }), this);
  }
}

export { RoutePortal as default };
//# sourceMappingURL=route-portal.js.map
