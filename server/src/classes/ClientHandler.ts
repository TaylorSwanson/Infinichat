
import Chunk from "~/classes/Chunk";

export default class ClientHandler{
  private socket;
  private chunkLoader;
  private subscriptions: Array<Chunk>;

  constructor(socket, chunkLoader) {
    this.socket = socket;
    this.chunkLoader = chunkLoader;

    this.socket.on("get", data => {
      const { x, y } = data;


    });

    this.socket.on("subscribe", data => {
      const { x, y } = data;

    });

    this.socket.on("unsubscribe", data => {
      const { x, y } = data;

    });

    this.socket.on("edit", data => {
      
    });
  }
}