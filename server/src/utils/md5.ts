
import crypto from "crypto";

export default function digest(string, encoding?) {
  const hash = crypto.createHash("md5");
  return hash.update(string, "utf8").digest(encoding ?? "hex");
};
