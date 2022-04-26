
import fs from "fs/promises";
import path from "path";

import md5 from "../utils/md5";
import Chunk from "./Chunk";
import { CharElement } from "../types/CharElement";

// size x size 
const size = 8;
const purgeIntervalSeconds = 10;

// This prevents a loading race condition (subscribe + get, for example)
// Hashes of chunks currently loading
const loadingHashes = [];

export default class ChunkLoader{
  private chunkCache;
  private timeout: number;
  private storagePath: string;
  private purgeInterval;

  constructor(storagePath, timeout = 60) {
    this.storagePath = storagePath;
    this.timeout = timeout * 1000;
    this.chunkCache = {};
    
    this.purgeInterval = setInterval(() => {
      this.purge();
    }, purgeIntervalSeconds * 1000);
  }

  private async load(x: number, y: number) {
    const hash = md5(`${x}x${y}`);
    const location = path.join(this.storagePath, hash);

    try {
      // Prevent race conditions where block is requested during loading
      if (loadingHashes.includes(hash)) return;
      loadingHashes.push(hash);

      const handle = await fs.open(location, "r");
      const content = (await handle.readFile()).toString();
      await handle.close();

      // Remove loading hash
      const idx = loadingHashes.indexOf(hash);
      if (idx !== -1) {
        loadingHashes.splice(idx, 1);
      }

      console.log(`Loaded chunk from file: ${location}, ${x}x${y}`);

      const json = JSON.parse(content);
      const check = md5(JSON.stringify(json.data));

      if (check.toString() !== json.checksum) {
        // Corrupted, delete
        console.error(`Chunk at ${x}x${y} is corrupt`);
        await fs.unlink(location);

        // Create new one
        return await this.load(x, y);
      }

      console.log(`Loaded chunk ${x}x${y} from file`);

      const chunk = new Chunk(json, this.storagePath);

      // Cache since this chunk exists
      if (this.chunkCache[hash]) return this.chunkCache[hash];
      this.chunkCache[hash] = chunk;

      return chunk;
    } catch (e) {
      // Remove loading hash, since this is a new chunk
      const idx = loadingHashes.indexOf(hash);
      if (idx !== -1) {
        loadingHashes.splice(idx, 1);
      }

      // Probably doesn't exist, create empty chunk
      const data: Array<CharElement> = new Array(size * size).fill({
        char: "",
        color: "",
        author: "",
        timestamp: Date.now()
      });

      const chunk = new Chunk({
        x,
        y,
        lastModified: Date.now(),
        data,
        checksum: md5(JSON.stringify(data)),
        isNew: true
      }, this.storagePath);
      
      console.log(`New chunk created at ${x}x${y}`);

      // Chunk doesn't get saved until it is first edited

      return chunk;
    }
  }

  // Remove old chunks
  private async purge() {
    const keys = Object.keys(this.chunkCache);
    const now = Date.now();

    keys.forEach(async k => {
      if (this.chunkCache[k].subscribers ?? 0 > 0) return;

      if (now - this.chunkCache[k].lastModified >= this.timeout) {
        console.log(`Unloading chunk ${k}...`);
        await this.chunkCache[k].save();
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
    if (loadingHashes.includes(hash)) {
      // Chunk is loading, wait for it to complete
      return new Promise((resolve, reject) => {
        setTimeout(async () => {
          if (!loadingHashes.includes(hash)) {
            if (!this.chunkCache[hash]) {
              // Recurse, this will trigger a new timer
              const chunk = await this.getChunk(x, y);
              resolve(chunk);
            } else {
              // Done loading
              resolve(this.chunkCache[hash]);
            }
          }
        }, 250);
      });
    } else {
      const chunk = await this.load(x, y);
      this.chunkCache[hash] = chunk;
  
      return chunk;
    }

  }
}