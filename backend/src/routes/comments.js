import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /comments — público
router.get('/', async (_req, res) => {
  const { data, error } = await supabase
    .from('comments')
    .select('id, user_name, text, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /comments — requiere auth
router.post('/', requireAuth, async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: 'El comentario no puede estar vacío' });

  const user_name = req.user.user_metadata?.full_name ||
                    req.user.email?.split('@')[0] ||
                    'Anónimo';

  const { data, error } = await supabase
    .from('comments')
    .insert({ user_id: req.user.id, user_name, text: text.trim() })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// DELETE /comments/:id — solo el autor
router.delete('/:id', requireAuth, async (req, res) => {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

export default router;
