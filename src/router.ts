import { ArrayMatcher } from '@remix-run/route-pattern';
import type { Match } from '@remix-run/route-pattern';
import type {
  RouteDefinition,
  ResolvedRoute,
  RouteLevel,
  RouteModule,
  ModuleFactory,
} from './types.ts';

export type OnMatchCallback = (levels: RouteLevel[]) => void;

type RouteMatch = Match<string, ResolvedRoute>;

export function flattenRoutes(
  definitions: RouteDefinition[],
  base: string,
  layoutChain: ModuleFactory[] = [],
): ResolvedRoute[] {
  const resolved: ResolvedRoute[] = [];

  for (const def of definitions) {
    if (def._type === 'layout') {
      const nextChain = def.moduleFactory
        ? [...layoutChain, def.moduleFactory]
        : layoutChain;
      if (def.children?.length) {
        resolved.push(...flattenRoutes(def.children, base, nextChain));
      }
    } else if (def._type === 'index') {
      const pattern = def.pattern ? joinPaths(base, def.pattern) : base || '/';
      resolved.push({
        fullPattern: pattern,
        moduleFactory: def.moduleFactory!,
        layoutChain,
      });
    } else {
      const pattern = joinPaths(base, def.pattern);
      if (def.moduleFactory) {
        resolved.push({
          fullPattern: pattern,
          moduleFactory: def.moduleFactory,
          layoutChain,
        });
      }
      if (def.children?.length) {
        resolved.push(...flattenRoutes(def.children, pattern, layoutChain));
      }
    }
  }

  return resolved;
}

function joinPaths(base: string, segment: string): string {
  const b = base.replace(/\/$/, '');
  const s = segment.replace(/^\//, '');
  return s ? `${b}/${s}` : b || '/';
}

async function buildLevel(
  mod: RouteModule,
  params: Record<string, string | undefined>,
  queryParams: URLSearchParams,
  request: Request,
): Promise<RouteLevel> {
  let loaderData: unknown;
  if (mod.loader) {
    loaderData = await mod.loader({ params, queryParams, request });
  }
  return { component: mod.default, loaderData, params, queryParams };
}

export class Router {
  readonly #base: string;
  readonly #matcher: ArrayMatcher<ResolvedRoute>;
  readonly #onMatch: OnMatchCallback;
  #renderToken = 0;

  constructor(
    config: RouteDefinition[],
    base: string = '/',
    onMatch: OnMatchCallback,
  ) {
    this.#onMatch = onMatch;
    this.#base = ('/' + base).replace(/\/+/g, '/').replace(/\/$/, '') || '/';

    this.#matcher = new ArrayMatcher<ResolvedRoute>();
    for (const route of flattenRoutes(config, this.#base)) {
      console.log('route is: ', route);
      this.#matcher.add(route.fullPattern, route);
    }

    window.navigation.addEventListener('navigate', this.#handleNavigate);

    const initialUrl = new URL(window.location.href);
    const initialMatches = this.#matcher.matchAll(initialUrl);
    console.log(initialMatches);
    if (initialMatches.length) {
      const token = ++this.#renderToken;
      void this.#renderForUrl(initialUrl, initialMatches, token);
    }
  }

  #isStale(token: number, signal?: AbortSignal): boolean {
    return (signal?.aborted ?? false) || this.#renderToken !== token;
  }

  #handleNavigate = (event: NavigateEvent): void => {
    if (
      !event.canIntercept ||
      event.hashChange ||
      event.downloadRequest !== null
    ) {
      return;
    }

    const url = new URL(event.destination.url);

    if (this.#base !== '/' && !url.pathname.startsWith(this.#base)) {
      return;
    }

    const matches = this.#matcher.matchAll(url);
    if (!matches.length) return;

    const token = ++this.#renderToken;

    if (event.formData !== null) {
      event.intercept({
        handler: async () => {
          await this.#handleAction(
            url,
            matches,
            token,
            event.formData!,
            event.signal,
          );
        },
      });
    } else {
      event.intercept({
        handler: async () => {
          await this.#renderForUrl(url, matches, token, event.signal);
        },
      });
    }
  };

  async #loadModules(
    leafMatch: RouteMatch,
    queryParams: URLSearchParams,
    token: number,
    signal?: AbortSignal,
  ): Promise<{
    mods: RouteModule[];
    params: Record<string, string | undefined>;
  } | null> {
    const { data: route } = leafMatch;
    const params = leafMatch.params as Record<string, string | undefined>;
    const allFactories = [...route.layoutChain, route.moduleFactory];

    let mods: RouteModule[];
    try {
      mods = await Promise.all(allFactories.map((f) => f()));
    } catch (error) {
      if (this.#isStale(token, signal)) return null;
      this.#onMatch([
        { component: {}, loaderData: error, params, queryParams },
      ]);
      return null;
    }

    if (this.#isStale(token, signal)) return null;
    return { mods, params };
  }

  async #buildAndEmit(
    url: URL,
    mods: RouteModule[],
    params: Record<string, string | undefined>,
    token: number,
    signal?: AbortSignal,
  ): Promise<void> {
    const request = new Request(url.href);
    const queryParams = url.searchParams;
    let levels: RouteLevel[];
    try {
      levels = await Promise.all(
        mods.map((mod) => buildLevel(mod, params, queryParams, request)),
      );
    } catch (error) {
      if (this.#isStale(token, signal)) return;
      const leafMod = mods[mods.length - 1]!;
      if (leafMod.ErrorBoundary) {
        this.#onMatch([
          {
            component: leafMod.ErrorBoundary,
            loaderData: error,
            params,
            queryParams,
          },
        ]);
      } else {
        throw error;
      }
      return;
    }

    if (this.#isStale(token, signal)) return;
    this.#onMatch(levels);
  }

  async #handleAction(
    url: URL,
    matches: RouteMatch[],
    token: number,
    formData: FormData,
    signal?: AbortSignal,
  ): Promise<void> {
    const result = await this.#loadModules(
      matches[0]!,
      url.searchParams,
      token,
      signal,
    );
    if (!result) return;

    const { mods, params } = result;
    const leafMod = mods[mods.length - 1]!;

    if (leafMod.action) {
      try {
        await leafMod.action({
          params,
          queryParams: url.searchParams,
          request: new Request(url.href, { method: 'POST', body: formData }),
        });
      } catch (error) {
        if (this.#isStale(token, signal)) return;
        if (leafMod.ErrorBoundary) {
          this.#onMatch([
            {
              component: leafMod.ErrorBoundary,
              loaderData: error,
              params,
              queryParams: url.searchParams,
            },
          ]);
        } else {
          throw error;
        }
        return;
      }
    }

    if (this.#isStale(token, signal)) return;
    await this.#buildAndEmit(url, mods, params, token, signal);
  }

  async #renderForUrl(
    url: URL,
    matches: RouteMatch[],
    token: number,
    signal?: AbortSignal,
  ): Promise<void> {
    const result = await this.#loadModules(
      matches[0]!,
      url.searchParams,
      token,
      signal,
    );
    if (!result) return;

    await this.#buildAndEmit(url, result.mods, result.params, token, signal);
  }

  destroy(): void {
    window.navigation.removeEventListener('navigate', this.#handleNavigate);
  }
}
