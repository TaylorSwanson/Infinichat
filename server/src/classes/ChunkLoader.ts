
import fs from "fs";

type Chunk = {
  x: number,
  y: number,
  lastModified: Date,
  data: string
}

export default class ChunkLoader{
  private chunks: Array<Chunk> = [];
  private timeout: number;

  constructor(timeout = 300) {
    this.timeout = timeout;
  }

  public loadChunk(x: number, y: number) {

  }
}