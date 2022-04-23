
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

  constructor(storagePath, timeout = 300) {
    this.storagePath = storagePath;
    this.timeout = timeout;
  }

  private async getFromDisk(x: number, y: number) {
    const hash = md5(`${x}-${y}`);

    try {
      const handle = await fs.open(path.join(this.storagePath, hash), "r");
      const content = (await handle.read()).buffer.toString();

      const block = JSON.parse(content);
      const check = md5(block.data)



    } catch (e) {
      // Probably doesn't exist, create empty block
      const data = Buffer.alloc(size * size).toString("utf8");
      return {
        lastModified: new Date(),
        data,
        checksum: md5(data)
      };
    }
  }

  public loadChunk(x: number, y: number) {
    x = Math.round(x);
    y = Math.round(y);
    const hash = md5(`${x}-${y}`);

    // Check for cache hit
    if (this.chunkCache.hasOwnProperty(hash)) {
      return this.chunkCache[hash];
    }

    const chunk = this.getFromDisk(x, y);
  }
}