
import fs from "fs/promises";
import path from "path";

import md5 from "../utils/md5";
import Chunk from "./Chunk";
import { CharElement } from "../types/CharElement";

// size x size 
const size = 32;

export default class ChunkLoader{
  private chunkCache;
  private timeout: number;
  private storagePath: string;
  private purgeInterval;

  constructor(storagePath, timeout = 300) {
    this.storagePath = storagePath;
    this.timeout = timeout * 1000;
    this.chunkCache = {};
    
    this.purgeInterval = setInterval(this.purge, 15 * 1000);
  }

  private async load(x: number, y: number) {
    const hash = md5(`${x}x${y}`);
    const location = path.join(this.storagePath, hash);

    try {
      const handle = await fs.open(location, "r");
      const content = (await handle.readFile()).toString();

      const json = JSON.parse(content);
      const check = md5(JSON.stringify(json.data));

      if (check.toString() !== json.checksum) {
        // Corrupted, delete
        console.error(`Chunk at ${x}x${y} is corrupt`);
        await fs.unlink(location);

        // Create new one
        return await this.load(x, y);
      }

      console.log(`Loaded chunk ${x}x${y}`);

      const chunk = new Chunk(json, this.storagePath);

      // Cache since this chunk exists
      const idx = this.chunkCache.indexOf(chunk);
      if (idx !== -1) return;
      this.chunkCache.push(chunk);

      return chunk;

    } catch (e) {
      // Probably doesn't exist, create empty chunk
      const data: Array<CharElement> = new Array(size * size).fill({
        char: "",
        color: null,
        author: null
      });

      console.log(`New chunk loaded at ${x}x${y}`);
      
      const chunk = new Chunk({
        x,
        y,
        lastModified: new Date(),
        data,
        checksum: md5(JSON.stringify(data))
      }, this.storagePath);

      // Just catch edit, don't do edits here
      // Cache this new chunk since it now has meaning (not empty)
      chunk.once("edit", async () => {
        const idx = this.chunkCache.indexOf(chunk);
        if (idx !== -1) return;

        this.chunkCache.push(chunk);
        await chunk.save();
      });

      return chunk;
    }
  }

  private async purge() {
    if (!this.chunkCache) return;

    const keys = Object.keys(this.chunkCache);
    const now = Date.now();

    keys.forEach(async k => {
      if (this.chunkCache[k].subscribers > 0) return;
      
      const chunkDate = this.chunkCache[k].lastModified as Date;
      if (now - chunkDate.getTime() >= this.timeout) {
        await this.chunkCache[k].save(this.storagePath);
        delete this.chunkCache[k];
      }
    });
  }

  public async getChunk(x: number, y: number) {
    x = Math.round(x);
    y = Math.round(y);
    const hash = md5(`${x}x${y}`);

    // Check for cache hit
    if (this.chunkCache.hasOwnProperty(hash)) {
      return this.chunkCache[hash];
    }

    // Cache miss, load/create
    const chunk = await this.load(x, y);
    this.chunkCache[hash] = chunk;

    return chunk;
  }
}