import { Elysia } from 'elysia';

const transpiler = new Bun.Transpiler({
  loader: "tsx", // "js | "jsx" | "ts" | "tsx"
});

const app = new Elysia()
  .get("basic.css", () => Bun.file("./basic.css"))
  .get("basic.ts", () => Bun.file("./basic.js"))
  // .get("basic.ts", () =>
  //   transpiler.transformSync(Bun.file("./basic.ts").toString())
  // )
  .get("*", () => Bun.file("./index.html"))
  .listen(8080);

console.log(`🦊 Elysia is running at on port ${app.server?.port}...`);
