"use strict";
const fs = require(`fs`);
const path = require(`path`);
const { nanoid } = require(`nanoid`);
const multer = require(`multer`);

const FILES_TYPE = [`image/png`, `image/jpg`, `image/jpeg`];
const UPLOAD_DIR = `../upload/img`;

if (!fs.existsSync(path.resolve(__dirname, UPLOAD_DIR))) {
  fs.mkdirSync(path.resolve(__dirname, "../upload/img"), { recursive: true });
}

const uploadAbsoluteDir = path.resolve(__dirname, UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadAbsoluteDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = nanoid(10);
    const extension = file.originalname.split(`.`).pop();
    cb(null, `${uniqueName}.${extension}`);
  },
  fileFilter: [`png`, `jpeg`],
});

const fileFilter = (req, file, cb) => {
  if (FILES_TYPE.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

module.exports = multer({ storage, fileFilter });
