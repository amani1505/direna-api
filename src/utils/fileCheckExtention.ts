import { BadRequestException } from '@nestjs/common';
import { extname } from 'path';

const allowedFileExtensions = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.svg',
];

/**
 * Checks if the file has a valid extension.
 * @param file - The uploaded file.
 * @returns boolean - true if valid, otherwise throws an exception.
 */
export function checkFileExtension(
  req: any,
  file: any,
  callback: any,
): boolean {
  const ext = extname(file.originalname).toLowerCase();
  if (!allowedFileExtensions.includes(ext)) {
    return callback(
      new BadRequestException(
        `Invalid file extension: ${ext}. Allowed extensions are: ${allowedFileExtensions.join(', ')}`,
      ),
      false,
    );
  }
  return callback(null, true);
}
