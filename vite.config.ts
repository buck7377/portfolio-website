import { defineConfig, type Plugin } from "vite";

/** Dev-only: /slow?ms=N answers a 1x1 gif after N ms, so tests can delay
 * the window load event and headless screenshots capture late states. */
const slowEndpoint: Plugin = {
  name: "slow-endpoint",
  configureServer(server) {
    server.middlewares.use("/slow", (req, res) => {
      const ms = Number(new URL(req.url ?? "", "http://x").searchParams.get("ms") ?? 3000);
      const gif = Buffer.from("R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==", "base64");
      setTimeout(() => {
        res.setHeader("Content-Type", "image/gif");
        res.end(gif);
      }, ms);
    });
  },
};

export default defineConfig({
  base: "/",
  server: { port: 5173 },
  plugins: [slowEndpoint],
});
