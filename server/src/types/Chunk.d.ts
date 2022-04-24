export type Chunk = {
  x: number,
  y: number,
  lastModified: Date,
  data: Array<CharElement>,
  checksum: string
};