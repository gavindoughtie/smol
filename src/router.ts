export type RouteHandler = (
  e: NavigateEvent,
  url: URL,
  pattern: URLPattern
) => Promise<void>;

export class Router {
  navigation: Navigation = (globalThis as any).navigation;
  routes: Map<URLPattern, RouteHandler> = new Map();

  constructor() {}

  // from https://developer.chrome.com/docs/web-platform/navigation-api
  shouldNotIntercept(navigationEvent: NavigateEvent) {
    return (
      !navigationEvent.canIntercept ||
      // If this is just a hashChange,
      // just let the browser handle scrolling to the content.
      navigationEvent.hashChange ||
      // If this is a download,
      // let the browser perform the download.
      navigationEvent.downloadRequest ||
      // If this is a form submission,
      // let that go to the server.
      navigationEvent.formData
    );
  }

  addPatternRoute(pattern: URLPattern, handler: RouteHandler) {
    this.routes.set(pattern, handler);
  }

  addStringRoute(patternString: string, handler: RouteHandler) {
    const pattern = new URLPattern({ pathname: `**/${patternString}` });
    this.addPatternRoute(pattern, handler);
  }

  addRoute(pattern: string | URLPattern, handler: RouteHandler) {
    if (typeof pattern === "string") {
      this.addStringRoute(pattern, handler);
    } else {
      this.addPatternRoute(pattern, handler);
    }
  }

  getRouteHandler(url: URL): [RouteHandler, URLPattern] | undefined {
    const pathname = url.pathname;
    for (let pattern of this.routes.keys()) {
      console.log(`testing`, pattern);
      if (pattern.test({ pathname })) {
        const handler = this.routes.get(pattern);
        if (!handler) {
          throw new Error(
            `handler not found for registered pattern ${pattern}`
          );
        }
        return [handler, pattern];
      }
    }
    return undefined;
  }

  handleNav(e: NavigateEvent) {
    if (this.shouldNotIntercept(e)) {
      return;
    }
    const url = new URL(e.destination.url);
    const handlerInfo = this.getRouteHandler(url);
    if (!handlerInfo) {
      return;
    }
    let handler: RouteHandler;
    let pattern: URLPattern;
    if (handlerInfo?.length) {
      handler = handlerInfo[0];
      pattern = handlerInfo[1];
    }
    e.intercept({
      handler: () => handler(e, url, pattern),
    });
  }

  listenForNav() {
    this.navigation.addEventListener("navigate", this.handleNav.bind(this));
  }
}
