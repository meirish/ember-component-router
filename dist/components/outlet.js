import Component from '@glimmer/component';
import { getOwner } from '@ember/owner';
import { getOrCreateContext } from '../router-context.js';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';

class Outlet extends Component {
  #context;
  #depth;
  constructor(owner, args) {
    super(owner, args);
    this.#context = getOrCreateContext(getOwner(this));
    this.#depth = this.#context.claimOutletDepth();
  }
  get #level() {
    return this.#context.levels[this.#depth];
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
    setComponentTemplate(precompileTemplate("{{#if this.currentComponent}}\n  {{component this.currentComponent loaderData=this.loaderData params=this.params queryParams=this.queryParams}}\n{{/if}}", {
      strictMode: true
    }), this);
  }
}

export { Outlet as default };
//# sourceMappingURL=outlet.js.map
