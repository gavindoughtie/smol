import { Elysia } from "elysia";

import { staticPlugin } from "@elysiajs/static";
import { swagger } from "@elysiajs/swagger";

const transpiler = new Bun.Transpiler({
  loader: "tsx", // "js | "jsx" | "ts" | "tsx"
});

async function getTranspiledResponse(filePath: string) {
  const contents = await Bun.file(filePath).text();
  const transpiled = transpiler.transformSync(contents);
  return new Response(transpiled, {
    headers: { "Content-Type": "text/javascript" },
  });
}

const srcRoutes = new Elysia()
  .get("*.ts", async (result: any) => {
    return new Response("TS handler\n" + JSON.stringify(result));
  })
  .listen(8088);

async function getRealFilePath(path: string, base?: string | undefined) {
  base = base || import.meta.dir;
  let file;
  let filePath = undefined;
  while (path) {
    let activePath = `${base}/${path}`;
    file = Bun.file(activePath);
    if (await file.exists()) {
      filePath = activePath;
      break;
    }
    if (path.indexOf("/") === -1) {
      return undefined;
    }
    path = path.substring(path.indexOf("/") + 1);
  }
  return filePath;
}

const app = new Elysia()
  .use(swagger())
  .get("*", async (request: any) => {
    let path = request?.params["*"] || "index.html";
    if (path.endsWith(".ts")) {
      let tsPath = path;
      let tsFilePath = await getRealFilePath(tsPath);
      if (path.startsWith("src/")) {
        tsPath = path.substring(4);
        tsFilePath = await getRealFilePath(
          tsPath,
          `${import.meta.dir}/../../src`
        );
      }
      if (!tsFilePath) {
        return new Response("404", { status: 404 });
      }
      return getTranspiledResponse(tsFilePath);
    }
    let filePath = await getRealFilePath(path);
    return Bun.file(filePath || `${import.meta.dir}/index.html`);
  })
  .use(
    staticPlugin({
      assets: "public",
      prefix: "/",
    })
  )
  .listen(8080);

export type ElysiaApp = typeof app;

console.log(`SMOL is running at http://localhost:${app.server?.port}`);
