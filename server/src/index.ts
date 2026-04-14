import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { authRouter } from './routes/auth';

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(cookieParser());
app.use(express.json());

if (!isProd) {
  app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true,
  }));
}

app.use('/api/auth', authRouter);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

if (isProd) {
  const staticPath = path.resolve(__dirname, '../../../dist/rareform/browser');
  app.use(express.static(staticPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
