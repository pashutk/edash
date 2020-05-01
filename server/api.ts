import { Router, RequestHandler } from "express";
import { generate as generateMapUrl } from "./mapUrl";
import path from "path";
import { convertToBMP as convertImageToBMP } from "./image";
import { exists as isFileExists, load as loadFile } from "./file";
import { PathLike, createReadStream } from "fs";
import { IMAGE_MAX_AGE, TRACKS } from "./config";
import { pngStreamToBitmap } from "./createBitmap";

let imageLoadedTs = 0;

const shouldLoadNewImage = async (oldImage: PathLike): Promise<boolean> => {
  const imageExists = await isFileExists(oldImage);
  if (!imageExists) {
    return true;
  }

  if (imageLoadedTs < Date.now() - IMAGE_MAX_AGE) {
    return true;
  }

  return false;
};

const updateMapImageIfNeeded = async (filename: string): Promise<boolean> => {
  const needToUpdate = await shouldLoadNewImage(filename);
  if (!needToUpdate) {
    return false;
  }

  const url = await generateMapUrl(TRACKS);
  await loadFile({ url, output: filename });
  console.log("Image loaded");

  imageLoadedTs = Date.now();
  return true;
};

const pngHanlder: RequestHandler = async (req, res, next) => {
  const imageNamePNG = path.resolve(__dirname, "image_cache/lastimage.png");
  await updateMapImageIfNeeded(imageNamePNG);

  res.sendFile(imageNamePNG, null, (err) => {
    if (err) {
      next(err);
    } else {
      console.log("File sent");
    }
  });
};

const bmpHandler: RequestHandler = async (req, res, next) => {
  const imageNamePNG = path.resolve(__dirname, "image_cache/lastimage.png");
  const imageNameBMP = path.resolve(__dirname, "image_cache/lastimage.bmp");

  const updated = await updateMapImageIfNeeded(imageNamePNG);
  if (updated) {
    await convertImageToBMP(imageNamePNG, imageNameBMP);
    console.log("Image converted");
  }

  res.sendFile(imageNameBMP, null, (err) => {
    if (err) {
      next(err);
    } else {
      console.log("File sent");
    }
  });
};

const binHandler: RequestHandler = async (req, res, next) => {
  const imageNamePNG = path.resolve(__dirname, "image_cache/lastimage.png");
  await updateMapImageIfNeeded(imageNamePNG);
  const bitmapBuffer = await pngStreamToBitmap(createReadStream(imageNamePNG));
  res.send(bitmapBuffer);
  // res.sendFile(imageNamePNG, null, (err) => {
  //   if (err) {
  //     next(err);
  //   } else {
  //     console.log("File sent");
  //   }
  // });
};

const randomHandler: RequestHandler = async (req, res, next) => {
  const imageNameJPG = path.resolve(__dirname, "image_cache/rand.jpg");
  const imageNameBMP = path.resolve(__dirname, "image_cache/rand.bmp");

  const url = "https://picsum.photos/640/384.jpg";
  await loadFile({ url, output: imageNameJPG });
  console.log("Image loaded");

  await convertImageToBMP(imageNameJPG, imageNameBMP);
  console.log("Image converted");

  res.sendFile(imageNameBMP, null, (err) => {
    if (err) {
      next(err);
    } else {
      console.log("File sent");
    }
  });
};

export const router = Router()
  .get("/image.bin", binHandler)
  .get("/image.png", pngHanlder)
  .get("/image.bmp", bmpHandler)
  .get("/random", randomHandler);