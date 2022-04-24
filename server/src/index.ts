
import http from "http";
import path from "path";
import fs from "fs";

import { Server } from "socket.io";

import ChunkLoader from "~/classes/ChunkLoader";
import ClientHandler from "~/classes/ClientHandler";

const port = 10001;

const server = http.createServer();
const io = new Server(server);

const location = path.join(process.env.STORAGE_PATH ?? __dirname, "chunks");
fs.mkdirSync(location, { recursive: true });

const clients = [];

function main() {
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
}

main();
