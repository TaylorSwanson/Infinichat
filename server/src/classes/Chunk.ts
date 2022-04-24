
import fs from "fs/promises";
import path from "path";
import { EventEmitter } from "events";

import md5 from "../utils/md5";
import { CharElement } from "../types/CharElement";

type ChunkElement = {
  x: number,
  y: number,
  lastModified: Date,
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
  public lastModified: Date;
  public data: Array<CharElement>;
  public checksum: string;

  private storagePath: string;
  private saveDebounced: Function;

  public constructor(data: ChunkElement, storagePath: string) {
    super();

    this.x = data.x;
    this.y = data.y;
    this.lastModified = data.lastModified;
    this.data = data.data;
    this.checksum = data.checksum;

    this.storagePath = storagePath;
    this.saveDebounced = debounce(this.save, 1000);
  }

  public async save() {
    const hash = md5(`${this.x}-${this.y}`);
    const location = path.join(this.storagePath, hash);

    this.lastModified = new Date();
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

  public edit(start: number, data: Array<CharElement>, editorId?: string) {
    data.forEach((char, i) => {
      this.data[start + i] = char;
    });

    this.lastModified = new Date();
    this.checksum = md5(JSON.stringify(this.data));

    // Someone may be listening
    this.emit("edit", {
      chunk: this,
      editorId
    });

    this.saveDebounced();
  }
}