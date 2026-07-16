import { rm } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(process.cwd());

for (const relativePath of ["dist/server/photos", "dist/server/video"]) {
  const target = resolve(root, relativePath);

  if (!target.startsWith(root)) {
    throw new Error(`Refusing to remove path outside project: ${target}`);
  }

  await rm(join(root, relativePath), { force: true, recursive: true });
}
