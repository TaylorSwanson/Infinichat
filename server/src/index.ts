import "source-map-support/register";

import http from "http";
import path from "path";
import fs from "fs";

import { Server } from "socket.io";

import ClientHandler from "./classes/ClientHandler";
import ChunkLoader from "./classes/ChunkLoader";

const port = 10001;

const origins = [
  "https://infini.chat",
  "http://infinichat.test:8080"
];

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: origins,
    methods: ["GET", "POST"]
  }
});

const location = path.join(
  path.resolve(process.env.STORAGE_PATH),
  "chunks"
);

const clients = [];

function main() {
  fs.mkdirSync(location, { recursive: true });

  const chunkLoader = new ChunkLoader(location);
  
  // Watch for incoming ws connections, events handled by ClientHandler
  io.on("connection", client => {
    console.log("Client connected", client.id);

    const handler = new ClientHandler(client, chunkLoader);
  
    clients.push(handler);
  
    client.on("disconnect", () => {   
      console.log("Client disconnected", client.id);
      
      // Remove reference
      const idx = clients.indexOf(handler);
      if (idx === -1) return;
  
      clients.splice(idx, 1);
    });
  });
  
  server.listen(port);
  console.log(`Listening on port ${port} and saving at ${location}`);
}

main();
