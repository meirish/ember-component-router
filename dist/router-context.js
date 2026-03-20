import { tracked } from '@glimmer/tracking';
import { g, i } from 'decorator-transforms/runtime-esm';

class RouterContext {
  static {
    g(this.prototype, "levels", [tracked], function () {
      return [];
    });
  }
  #levels = (i(this, "levels"), void 0);
  #outletDepth = 1;
  claimOutletDepth() {
    return this.#outletDepth++;
  }
  resetOutletDepth() {
    this.#outletDepth = 1;
  }
}
const registry = new WeakMap();
function getOrCreateContext(owner) {
  let ctx = registry.get(owner);
  if (!ctx) {
    ctx = new RouterContext();
    registry.set(owner, ctx);
  }
  return ctx;
}

export { RouterContext, getOrCreateContext };
//# sourceMappingURL=router-context.js.map
