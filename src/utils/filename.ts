import { extname } from 'path';

export const Filename = (req: any, file: any, callback: any) => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const ext = extname(file.originalname);
  callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
};
