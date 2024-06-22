/*
* dev: Sazumi Viki
* github: github.com/sazumivicky
* ig: @moe.sazumiviki
* site: www.sazumi.moe
*/

import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import mime from 'mime-types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const shareSchema = new mongoose.Schema({
  name: String,
  khodam: String,
  photoUrl: String,
  shareId: String
});

const viewSchema = new mongoose.Schema({
  totalViews: { type: Number, default: 0 }
});

const Share = mongoose.model('Share', shareSchema);
const View = mongoose.model('View', viewSchema);

const tmpDir = './tmp';
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tmpDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const mimeType = mime.lookup(file.originalname);
  if (mimeType && mimeType.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image files are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(async (req, res, next) => {
  let viewData = await View.findOne();
  if (!viewData) {
    viewData = new View();
    await viewData.save();
  }

  if (!req.cookies.viewed) {
    viewData.totalViews += 1;
    await viewData.save();
    res.cookie('viewed', 'true', { maxAge: 24 * 60 * 60 * 1000 });
  }

  res.locals.totalViews = viewData.totalViews;
  next();
});

async function uploadToCdn(filePath) {
  const formData = new FormData();
  formData.append('fileInput', fs.createReadStream(filePath));

  try {
    const response = await fetch('https://cdn.sazumi.moe/upload', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const fileUrl = await response.json();
      console.log('Successfully:', fileUrl);
      return fileUrl.url_response;
    } else {
      const errorResponse = await response.json();
      console.error('oops something went wrong:', errorResponse);
      throw new Error('Failed to upload to CDN');
    }
  } catch (error) {
    console.error('oops something went wrong:', error.message);
    throw error;
  }
}

app.post('/submit', upload.single('photo'), async (req, res) => {
  const name = req.body.name;
  const localPhotoPath = req.file.path;

  try {
    const photoUrl = await uploadToCdn(localPhotoPath);

    fs.readFile('./khodam/list.txt', 'utf8', async (err, data) => {
      if (err) {
        console.error('Error reading khodam list:', err);
        return res.status(500).send('Internal Server Error');
      }

      const khodams = data.split('\n').filter(k => k.trim().length > 0);
      const randomKhodam = khodams[Math.floor(Math.random() * khodams.length)];

      const shareId = crypto.randomBytes(3).toString('hex');
      const newShare = new Share({ name, khodam: randomKhodam, photoUrl, shareId });
      await newShare.save();

      res.json({ name, khodam: randomKhodam, photoUrl, shareId });
    });
  } catch (error) {
    res.status(500).send('Failed to upload photo');
  }
});

app.get('/share/:id', async (req, res) => {
  const shareData = await Share.findOne({ shareId: req.params.id });

  if (!shareData) {
    return res.status(404).send('Not Found');
  }

  res.sendFile(path.join(__dirname, 'public', 'share.html'));
});

app.get('/share-data/:id', async (req, res) => {
  const shareData = await Share.findOne({ shareId: req.params.id });

  if (!shareData) {
    return res.status(404).send('Not Found');
  }

  res.json(shareData);
});

app.get('/total-views', async (req, res) => {
  const viewData = await View.findOne();
  res.json({ totalViews: viewData.totalViews });
});

app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
