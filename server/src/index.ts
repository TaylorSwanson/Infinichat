
import http from "http";
import { Server } from "socket.io";

import ChunkLoader from "~/classes/ChunkLoader";
import ClientHandler from "~/classes/ClientHandler";

const port = 10001;

const server = http.createServer();
const io = new Server(server);

const clients = [];

io.on("connection", client => {

  clients.push(new ClientHandler(client));

  client.on("event", data => { 
    console.log("data", data);
  });
  client.on("disconnect", () => {   
    console.log("Client disconnected", client.id);
  });
});


server.listen(port);