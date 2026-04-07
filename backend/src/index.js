import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import commentsRouter from './routes/comments.js';
import presupuestoRouter from './routes/presupuesto.js';
import authRouter from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// ─── Health check ──────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ ok: true }));

// ─── Routes ────────────────────────────────────────────────────
app.use('/auth', authRouter);
app.use('/comments', commentsRouter);
app.use('/presupuesto', presupuestoRouter);

// ─── 404 ───────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// ─── Error handler ─────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => console.log(`✅ Electro Rayo API corriendo en http://localhost:${PORT}`));
