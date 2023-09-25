import sharp, { AvailableFormatInfo } from "sharp";
import imageSize from "image-size";
import fileType from "file-type";

export interface ImageScaler {
  scale(
    imageBufferArray: Buffer[],
    maxWidth: number,
    maxHeight: number,
    formatType: AvailableFormatInfo
  ): Promise<Buffer[]>;
  supported(photoBuffer: Buffer): Promise<boolean>;
  resizeable(photoBuffer: Buffer): Promise<boolean>;
}

export class SharpImageScaler implements ImageScaler {
  async resizeable(photoBuffer: Buffer): Promise<boolean> {
    const dimensions = imageSize(photoBuffer);
    return !dimensions;
  }
  async scale(
    imageBufferArray: Buffer[],
    maxWidth: number,
    maxHeight: number,
    formatType: AvailableFormatInfo
  ): Promise<Buffer[]> {
    if (imageBufferArray.length == 0) return [];
    const validPhotos: Buffer[] = [];
    for (const photo of imageBufferArray) {
      if (await this.supported(photo)) {
        console.warn("Invalid file type");
        continue;
      }

      if (await this.resizeable(photo)) {
        console.warn("Image dimensions were not able to be found");
        continue;
      }

      const resizedImage = await sharp(photo)
        .resize({ width: maxWidth, height: maxHeight })
        .toFormat(formatType)
        .toBuffer();
      validPhotos.push(resizedImage);
    }

    return validPhotos;
  }
  async supported(photoBuffer: Buffer): Promise<boolean> {
    const fType: fileType.FileTypeResult | undefined =
      await fileType.fileTypeFromBuffer(photoBuffer);
    return !fType || !fType.mime.startsWith("image/");
  }
}
