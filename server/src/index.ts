import uws from "./lib/uWebSockets/uws";

const port = 10001;

async function main() {
  const app = uws.App({})
  .ws("/*", {
    compression: uws.SHARED_COMPRESSOR,
    maxPayloadLength: 16 * 1024,
    idleTimeout: 8,
    upgrade: (res, req, context) => {
      console.log("HTTP upgrade: " + req.getUrl());

      res.upgrade({ url: req.getUrl() },
        req.getHeader("sec-websocket-key"),
        req.getHeader("sec-websocket-protocol"),
        req.getHeader("sec-websocket-extensions"),
        context
      );
    },
    open: (ws) => {
      console.log("A WebSocket connected with URL: " + ws.url);
    },
    message: (ws, message, isBinary) => {
      /* Ok is false if backpressure was built up, wait for drain */
      let ok = ws.send(message, isBinary);
    },
    drain: (ws) => {
      console.log("WebSocket backpressure: " + ws.getBufferedAmount());
    },
    close: (ws, code, message) => {
      console.log("WebSocket closed");
    }
  }).any("/*", (res, req) => {
    res.end("Please use uWS");
  }).listen(port, token => {
    if (token) {
      console.log("Listening on port", port);
    }
  });
}

main();