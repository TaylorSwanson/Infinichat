
import Chunk from "./Chunk";

export default class ClientHandler{
  private socket;
  private chunkLoader;
  private subscriptions: Array<Chunk> = [];
  private subscriptionsInProgress: Array<string> = [];

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

    this.socket.on("subscribe", async payload => {
      const { x, y } = payload;
      const key = `${x}x${y}`;

      // Don't subscribe multiple times
      if (this.subscriptions[key]) return;

      console.log("Subscribing", x, y);

      // Eliminate race condition between rapid subscribe/unsubscribe
      if (this.subscriptionsInProgress.find(s => s === key)) return;
      this.subscriptionsInProgress.push(key);

      const chunk = await this.chunkLoader.getChunk(x, y);
      this.subscriptions[key] = chunk;

      // Keep the chunk alive
      chunk.subscribers++;
      
      // Start subscription
      this.subscriptions[key]?.on("edit", this.editListenerHandler);

      // Remove "in progress" flag
      const idx = this.subscriptionsInProgress.findIndex(s => s === key);
      if (idx === -1) return;
      this.subscriptionsInProgress.splice(idx, 1);
    });

    this.socket.on("unsubscribe", payload => {
      const { x, y } = payload;
      const key = `${x}x${y}`;
      
      // Stop subscription
      if (this.subscriptions[key]) {
        this.subscriptions[key].off("edit", this.editListenerHandler);
        this.subscriptions[key].subscribers--;
      }

      console.log("Unsubscribing", x, y);

      // Unref
      delete this.subscriptions[key];
    });

    this.socket.on("edit", payload => {
      const { x, y, start, data } = payload;

      const chunk = this.chunkLoader.get(x, y);
      chunk.edit(start, data, this.socket.id);
    });

    this.socket.on("disconnect", () => {
      // Unsubscribe from all
      this.subscriptions.forEach(subscription => {
        subscription.off("edit", this.editListenerHandler as any);
        subscription.subscribers--;
      });

      this.subscriptions = [];
    });
  }
}