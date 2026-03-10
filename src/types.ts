export interface LoaderArgs {
  params: Record<string, string | undefined>;
  request: Request;
}

export interface ActionArgs {
  params: Record<string, string | undefined>;
  request: Request;
}

export interface RouteModule {
  default: object;
  loader?: (args: LoaderArgs) => Promise<unknown> | unknown;
  action?: (args: ActionArgs) => Promise<unknown> | unknown;
  ErrorBoundary?: object;
}

export type ModuleFactory = () => Promise<RouteModule>;

export interface RouteDefinition {
  _type: 'route' | 'index' | 'layout';
  pattern: string;
  moduleFactory?: ModuleFactory;
  children?: RouteDefinition[];
}

export interface ResolvedRoute {
  fullPattern: string;
  moduleFactory: ModuleFactory;
  layoutChain: ModuleFactory[];
}

export interface RouteLevel {
  component: object;
  loaderData: unknown;
  params: Record<string, string | undefined>;
}
