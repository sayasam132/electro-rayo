import { Router } from 'express';
import { supabase } from '../supabase.js';

const router = Router();

// POST /presupuesto — público, cualquiera puede enviar
router.post('/', async (req, res) => {
  const { nombre, telefono, email, zona, servicio, inmueble, descripcion } = req.body;

  if (!nombre?.trim() || !telefono?.trim() || !servicio?.trim()) {
    return res.status(400).json({ error: 'Nombre, teléfono y servicio son obligatorios' });
  }

  const { data, error } = await supabase
    .from('presupuestos')
    .insert({ nombre, telefono, email, zona, servicio, inmueble, descripcion })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ ok: true, id: data.id });
});

// GET /presupuesto — solo accesible con service role (admin)
router.get('/', async (_req, res) => {
  const { data, error } = await supabase
    .from('presupuestos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;
