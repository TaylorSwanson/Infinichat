
import Chunk from "./Chunk";

export default class ClientHandler{
  private socket;
  private chunkLoader;
  private subscriptions: Array<Chunk>;

  private editListenerHandler: Function;

  constructor(socket, chunkLoader) {
    this.socket = socket;
    this.chunkLoader = chunkLoader;

    // Handles edit events from chunks
    this.editListenerHandler = (chunkPayload) => {
      // Don't send change to editor (ourselves)
      if (chunkPayload.editorId === socket.id) return;

      socket.send("edit", { chunk: chunkPayload.chunk });
    }

    this.socket.on("get", async data => {
      const { x, y } = data;

      console.log("Getting", x, y);

      const chunk = await this.chunkLoader.getChunk(x, y);
      socket.send("chunk", chunk.get());
    });

    this.socket.on("subscribe", payload => {
      const { x, y } = payload;
      const key = `${x}-${y}`;

      // Don't subscribe multiple times
      if (this.subscriptions[key]) return;

      const chunk = this.chunkLoader.get(x, y);
      this.subscriptions.push(chunk);
      
      // Start subscription
      this.subscriptions[key]?.on("edit", this.editListenerHandler);
    });

    this.socket.on("unsubscribe", payload => {
      const { x, y } = payload;
      const key = `${x}-${y}`;

      // Stop subscription
      this.subscriptions[key]?.off("edit", this.editListenerHandler);
      // Unref
      delete this.subscriptions[key];
    });

    this.socket.on("edit", payload => {
      const { x, y, start, data } = payload;

      const chunk = this.chunkLoader.get(x, y);
      chunk.edit(start, data, this.socket.id);
    });
  }
}