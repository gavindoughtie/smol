// ../../src/router.ts
class Router {
  navigation = globalThis.navigation;
  routes = new Map;
  constructor() {
  }
  shouldNotIntercept(navigationEvent) {
    return !navigationEvent.canIntercept || navigationEvent.hashChange || navigationEvent.downloadRequest || navigationEvent.formData;
  }
  addPatternRoute(pattern, handler) {
    this.routes.set(pattern, handler);
  }
  addStringRoute(patternString, handler) {
    const pattern = new URLPattern({ pathname: `**/${patternString}` });
    this.addPatternRoute(pattern, handler);
  }
  addRoute(pattern, handler) {
    if (typeof pattern === "string") {
      this.addStringRoute(pattern, handler);
    } else {
      this.addPatternRoute(pattern, handler);
    }
  }
  getRouteHandler(url) {
    const pathname = url.pathname;
    for (let pattern of this.routes.keys()) {
      console.log(`testing`, pattern);
      if (pattern.test({ pathname })) {
        const handler = this.routes.get(pattern);
        if (!handler) {
          throw new Error(`handler not found for registered pattern ${pattern}`);
        }
        return [handler, pattern];
      }
    }
    return;
  }
  handleNav(e) {
    if (this.shouldNotIntercept(e)) {
      return;
    }
    const url = new URL(e.destination.url);
    const handlerInfo = this.getRouteHandler(url);
    if (!handlerInfo) {
      return;
    }
    let handler;
    let pattern;
    if (handlerInfo?.length) {
      handler = handlerInfo[0];
      pattern = handlerInfo[1];
    }
    e.intercept({
      handler: () => handler(e, url, pattern)
    });
  }
  listenForNav() {
    this.navigation.addEventListener("navigate", this.handleNav.bind(this));
  }
}

// basic.ts
function updateContent(someContent) {
  const contentElement = document.querySelector("#content");
  if (contentElement) {
    contentElement.innerHTML = someContent;
  }
}
async function rootHandler(e, url, pattern) {
  let content = document.querySelector("#content");
  if (content) {
    if (content.firstChild) {
      content.removeChild(content.firstChild);
    }
    content.appendChild(explainerContent);
  }
}
async function fooHandler(e, url, pattern) {
  updateContent(`foo handler called ${url.pathname}`);
  try {
    const result = pattern.exec({ pathname: url.pathname });
    const subfoo = result?.pathname?.groups?.subfoo;
    updateContent(`foo handler (${subfoo}) ${e} ${url}`);
  } catch (err) {
    updateContent(`${err}`);
  }
}
async function barHandler(e, url, pattern) {
  updateContent("bar handler");
}
async function bazHandler(e, url, pattern) {
  updateContent("waiting 3 seconds for baz handler...");
  let p = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, 3000);
  });
  await p;
  updateContent("baz handler");
}
function initRoutes() {
  router2.addRoute("root", rootHandler);
  router2.addRoute("foo/:subfoo?", fooHandler);
  router2.addRoute("bar", barHandler);
  router2.addRoute("baz", bazHandler);
}
function main() {
  initRoutes();
  router2.listenForNav();
}
var router2 = new Router;
globalThis["router"] = router2;
var explainerContent = document.querySelector("#explainer");
main();
