import { Router } from '../../src/router.ts';

const router = new Router();
(globalThis as any)["router"] = router;

const explainerContent: HTMLElement = document.querySelector(
  "#explainer"
) as HTMLElement;

function updateContent(someContent: string) {
  const contentElement = document.querySelector("#content");
  if (contentElement) {
    contentElement.innerHTML = someContent;
  }
}

async function rootHandler(e: NavigateEvent, url: URL, pattern: URLPattern) {
  let content = document.querySelector("#content");
  if (content) {
    if (content.firstChild) {
      content.removeChild(content.firstChild);
    }
    content.appendChild(explainerContent);
  }
}

async function fooHandler(e: NavigateEvent, url: URL, pattern: URLPattern) {
  updateContent(`foo handler called ${url.pathname}`);
  try {
    const result = pattern.exec({ pathname: url.pathname });
    const subfoo = result?.pathname?.groups?.subfoo;
    updateContent(`foo handler (${subfoo}) ${e} ${url}`);
  } catch (err) {
    updateContent(`${err}`);
  }
}

async function barHandler(e: NavigateEvent, url: URL, pattern: URLPattern) {
  updateContent("bar handler");
}

async function bazHandler(e: NavigateEvent, url: URL, pattern: URLPattern) {
  updateContent("waiting 3 seconds for baz handler...");
  let p = new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, 3000);
  });
  await p;
  updateContent("baz handler");
}

function initRoutes() {
  router.addRoute("root", rootHandler);
  router.addRoute("foo/:subfoo?", fooHandler);
  router.addRoute("bar", barHandler);
  router.addRoute("baz", bazHandler);
}

function main() {
  initRoutes();
  router.listenForNav();
}

main();
