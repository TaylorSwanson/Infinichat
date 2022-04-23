
import fs from "fs/promises";
import path from "path";

import md5 from "~/utils/md5";
import { Chunk } from "~/types/Chunk";
import { CharElement } from "~/types/CharElement";

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

  private async load(x: number, y: number) {
    const hash = md5(`${x}-${y}`);
    const location = path.join(this.storagePath, hash);

    try {
      const handle = await fs.open(location, "r");
      const content = (await handle.read()).buffer.toString();

      const chunk = JSON.parse(content);
      const check = md5(JSON.stringify(chunk.data));

      if (check.toString() !== chunk.checksum) {
        // Corrupted, delete
        console.error(`Chunk at ${x}-${y} is corrupt`);
        await fs.unlink(location);

        // Create new one
        return await this.load(x, y);
      }

      return chunk;
    } catch (e) {
      // Probably doesn't exist, create empty chunk
      const data: Array<CharElement> = new Array(size * size).fill({
        char: "",
        color: null,
        author: null
      });

      console.log(`New chunk loaded at ${x}-${y}`);

      return {
        x,
        y,
        lastModified: new Date(),
        data,
        checksum: md5(data)
      };
    }
  }

  private async save(chunk) {
    const hash = md5(`${chunk.x}-${chunk.y}`);
    const location = path.join(this.storagePath, hash);

    chunk.lastModified = new Date();
    chunk.checkSum = md5(JSON.stringify(chunk.data));

    const saveData = JSON.stringify(chunk);

    try {
      await fs.writeFile(location, saveData);
    } catch (e) {
      console.error(`Could not save chunk ${hash}: ${e.code}`);
    }
  }

  private async purge() {
    const keys = Object.keys(this.chunkCache);
    const now = Date.now();

    keys.forEach(async k => {
      const chunkDate = this.chunkCache[k].lastModified as Date;
      if (now - chunkDate.getTime() >= this.timeout) {
        await this.save(this.chunkCache[k]);
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
    const chunk = await this.load(x, y);
    this.chunkCache[hash] = chunk;

    return chunk;
  }
}