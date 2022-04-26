
import fs from "fs/promises";
import path from "path";
import { EventEmitter } from "events";

import md5 from "../utils/md5";
import { CharElement } from "../types/CharElement";

// Seconds between saves
const saveDebouncedInterval = 10;

type ChunkElement = {
  x: number,
  y: number,
  lastModified: number,
  data: Array<CharElement>,
  checksum: string
};

const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

export default class Chunk extends EventEmitter {
  public x: number;
  public y: number;
  public subscribers = 0;
  public lastModified: number;
  public data: Array<CharElement>;
  public checksum: string;

  private storagePath: string;
  private saveDebounced: Function;

  public constructor(initial: ChunkElement, storagePath: string) {
    super();

    this.x = initial.x;
    this.y = initial.y;
    this.lastModified = initial.lastModified;
    this.data = initial.data;
    this.checksum = initial.checksum;

    this.storagePath = storagePath;
    this.saveDebounced = debounce(this.save, saveDebouncedInterval * 1000);
  }

  public async save() {
    const hash = md5(`${this.x}x${this.y}`);
    const location = path.join(this.storagePath, hash);

    console.log(`Saving chunk ${this.x}x${this.y} at ${location}`);

    this.checksum = md5(JSON.stringify(this.data));

    const saveData = JSON.stringify({
      x: this.x,
      y: this.y,
      lastModified: this.lastModified,
      data: this.data,
      checksum: this.checksum
    });

    try {
      await fs.writeFile(location, saveData);
    } catch (e) {
      console.error(`Could not save chunk ${hash}: ${e.code}`);
    }
  }

  public edit(index: number, char: CharElement, editorId?: string) {
    this.data[index] = char;

    this.lastModified = Date.now();
    this.checksum = md5(JSON.stringify(this.data));

    this.emit("edit", {
      x: this.x,
      y: this.y,
      index,
      char,
      time: Date.now(),
      editorId
    });

    this.saveDebounced();
  }

  public get() {
    return {
      x: this.x,
      y: this.y,
      data: this.data,
      lastModified: this.lastModified
    };
  }
}