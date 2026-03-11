declare global {
  interface Window {
    readonly navigation: Navigation;
  }

  interface Navigation extends EventTarget {
    readonly currentEntry: NavigationHistoryEntry;
    navigate(url: string, options?: NavigateOptions): NavigationResult;
    addEventListener(
      type: 'navigate',
      listener: (event: NavigateEvent) => void,
    ): void;
    removeEventListener(
      type: 'navigate',
      listener: (event: NavigateEvent) => void,
    ): void;
  }

  interface NavigationHistoryEntry {
    readonly url: string | null;
    readonly key: string;
  }

  interface NavigateEvent extends Event {
    readonly canIntercept: boolean;
    readonly hashChange: boolean;
    readonly downloadRequest: string | null;
    readonly formData: FormData | null;
    readonly destination: NavigationDestination;
    readonly signal: AbortSignal;
    readonly navigationType: 'push' | 'replace' | 'reload' | 'traverse';
    intercept(options: {
      handler: () => Promise<void>;
      scroll?: 'after-transition' | 'manual';
    }): void;
    scroll(): void;
  }

  interface NavigationDestination {
    readonly url: string;
  }

  interface NavigateOptions {
    history?: 'auto' | 'push' | 'replace';
    state?: unknown;
    info?: unknown;
  }

  interface NavigationResult {
    committed: Promise<NavigationHistoryEntry>;
    finished: Promise<NavigationHistoryEntry>;
  }
}

export {};
