import { tracked } from '@glimmer/tracking';
import type { RouteLevel } from './types.ts';

export class RouterContext {
  @tracked levels: RouteLevel[] = [];
  #outletDepth = 1;

  claimOutletDepth(): number {
    return this.#outletDepth++;
  }

  resetOutletDepth(): void {
    this.#outletDepth = 1;
  }
}

const registry = new WeakMap<object, RouterContext>();

export function getOrCreateContext(owner: object): RouterContext {
  let ctx = registry.get(owner);
  if (!ctx) {
    ctx = new RouterContext();
    registry.set(owner, ctx);
  }
  return ctx;
}
