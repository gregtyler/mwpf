import path from "path";
import fs from "fs";
import sharp from "sharp";

export function buildResizeFilter(baseDir) {
  return async function resizeFilter(thumbnailURL, width) {
    // Calculate file name
    const extension = path.extname(thumbnailURL);
    const newName = `${path.basename(thumbnailURL, extension)}-${width}${extension}`;
    const targetPath = path.resolve(baseDir, "images", newName);

    // Check if the work is already done
    if (fs.existsSync(targetPath)) {
      return `/images/${newName}`;
    }

    // Fetch image
    if (thumbnailURL.startsWith("//")) thumbnailURL = `https:${thumbnailURL}`;
    const response = await fetch(thumbnailURL);

    // Resize image
    try {
      const imageBuffer = await readableStreamToBuffer(response.body);
      await sharp(imageBuffer)
        .resize(width)
        .toFile(path.resolve(baseDir, "images", newName));
    } catch (err) {
      console.error(`Error processing image ${thumbnailURL}: ${err}`);
    }

    // Return file name
    return `/images/${newName}`;
  };
}

async function readableStreamToBuffer(readableStream) {
  const buffers = [];

  for await (const data of readableStream) {
    buffers.push(data);
  }

  return Buffer.concat(buffers);
}
