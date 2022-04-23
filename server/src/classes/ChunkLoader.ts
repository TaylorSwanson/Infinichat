
import fs from "fs/promises";
import path from "path";

import md5 from "~/utils/md5";
import { Chunk } from "~/types/Chunk";

// size x size 
const size = 128;

export default class ChunkLoader{
  private chunkCache = {};
  private timeout: number;
  private storagePath: string;
  private interval;

  constructor(storagePath, timeout = 300) {
    this.storagePath = storagePath;
    this.timeout = timeout * 1000;
    
    this.interval = setInterval(this.purge, 15 * 1000);
  }

  private async getFromDisk(x: number, y: number) {
    const hash = md5(`${x}-${y}`);
    const location = path.join(this.storagePath, hash);

    try {
      const handle = await fs.open(location, "r");
      const content = (await handle.read()).buffer.toString();

      const block = JSON.parse(content);
      const check = md5(block.data)

      if (check.toString() !== block.checksum) {
        // Corrupted, delete
        console.error(`Block at ${x}-${y} is corrupt`);
        await fs.unlink(location);

        // Create new one
        return await this.getFromDisk(x, y);
      }

      return block;
    } catch (e) {
      // Probably doesn't exist, create empty block
      const data = Buffer.alloc(size * size).toString("utf8");

      console.log(`New block loaded at ${x}-${y}`);

      return {
        x,
        y,
        lastModified: new Date(),
        data,
        checksum: md5(data)
      };
    }
  }

  private async purge() {
    const keys = Object.keys(this.chunkCache);
    const now = Date.now();

    keys.forEach(k => {
      const chunkDate = this.chunkCache[k].lastModified as Date;
      if (now - chunkDate.getTime() >= this.timeout) {
        delete this.chunkCache[k];
      }
    });
  }

  public async loadChunk(x: number, y: number) {
    x = Math.round(x);
    y = Math.round(y);
    const hash = md5(`${x}-${y}`);

    // Check for cache hit
    if (this.chunkCache.hasOwnProperty(hash)) {
      return this.chunkCache[hash];
    }

    // Cache miss, load/create
    const chunk = await this.getFromDisk(x, y);
    this.chunkCache[hash] = chunk;

    return chunk;
  }
}