import uws from "~/lib/uWebSockets";

const port = 9001;

async function main() {
  const app = uws.App({})
  .ws("/*", {
    compression: uws.SHARED_COMPRESSOR,
    maxPayloadLength: 16 * 1024,
    idleTimeout: 10,
  }).any('/*', (res, req) => {
    res.end("Use uWS");
  }).listen(port, token => {
    if (token) {
      console.log("Listening on port", port);
    }
  });
}

main();