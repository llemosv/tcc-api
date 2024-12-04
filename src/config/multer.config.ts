import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

const destinationFolder = join(__dirname, '../../../tmp');

const multerConfig = {
  fileFilter: (_: any, file: any, cb: any) => {
    cb(null, true);
  },
  storage: diskStorage({
    destination: destinationFolder,
    filename: (_, file, cb) => {
      cb(null, file.originalname);
    },
  }),
};

export default multerConfig;
