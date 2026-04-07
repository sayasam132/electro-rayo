import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /auth/register — registrar usuario
router.post('/register', async (req, res) => {
  const { email, password, nombre } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña son requeridos' });

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { full_name: nombre || email.split('@')[0] },
    email_confirm: true
  });

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ ok: true, user: { id: data.user.id, email: data.user.email } });
});

// GET /auth/me — ver perfil propio
router.get('/me', requireAuth, (req, res) => {
  const { id, email, user_metadata } = req.user;
  res.json({ id, email, nombre: user_metadata?.full_name });
});

export default router;
