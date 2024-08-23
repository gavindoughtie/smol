import { Elysia } from "elysia";

// import { autoload } from "elysia-autoload";
import { staticPlugin } from "@elysiajs/static";

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

const app = new Elysia()
  // .use(
  //   await autoload({
  //     pattern: "**/*.ts",
  //     dir: "./routes/exports",
  //   })
  // )
  .get("/", () => Bun.file("./index.html"))
  .get("/src/:tsfile", async (result: any) => {
    const filePath = `${import.meta.dir}/../..${result?.path}`;
    return getTranspiledResponse(filePath);
  })
  .get("basic.ts", async (result: any) => {
    const filePath = `${import.meta.dir}${result?.path}`;
    return getTranspiledResponse(filePath);
  })
  .get("*", async (result: any) => {
    return Response.redirect(`/`, 301);
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
