import { promises as fs } from "fs";
import { resolve } from "path";

export async function copy(src, dest) {
  const stat = await fs.lstat(src);
  if (stat.isFile()) {
    fs.copyFile(src, dest);

    return;
  }

  const [entries] = await Promise.all([
    fs.readdir(src, { withFileTypes: true }),
    fs.mkdir(dest, { recursive: true }),
  ]);

  await Promise.all(
    entries.map((entry) => {
      const srcPath = resolve(src, entry.name);
      const destPath = resolve(dest, entry.name);
      return entry.isDirectory()
        ? copy(srcPath, destPath)
        : fs.copyFile(srcPath, destPath);
    })
  );
}
