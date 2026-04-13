import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireAuth } from '../middleware/auth.js';

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

  // Notificación email al admin (no bloqueante)
  if (process.env.RESEND_API_KEY) {
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Electro Rayo <onboarding@resend.dev>',
        to: process.env.ADMIN_EMAIL || 'sayasammejia2@gmail.com',
        subject: `⚡ Nuevo presupuesto de ${nombre}`,
        html: `
          <h2>Nueva solicitud de presupuesto</h2>
          <table>
            <tr><td><strong>Nombre:</strong></td><td>${nombre}</td></tr>
            <tr><td><strong>Teléfono:</strong></td><td>${telefono}</td></tr>
            <tr><td><strong>Email:</strong></td><td>${email || '—'}</td></tr>
            <tr><td><strong>Servicio:</strong></td><td>${servicio}</td></tr>
            <tr><td><strong>Zona:</strong></td><td>${zona || '—'}</td></tr>
            <tr><td><strong>Inmueble:</strong></td><td>${inmueble || '—'}</td></tr>
            <tr><td><strong>Descripción:</strong></td><td>${descripcion || '—'}</td></tr>
          </table>
          <p><a href="https://electro-rayo.onrender.com/admin">Ver en el panel admin</a></p>
        `
      })
    }).catch(err => console.error('Email error:', err));
  }

  res.status(201).json({ ok: true, id: data.id });
});

// GET /presupuesto — solo admin autenticado
router.get('/', requireAuth, async (_req, res) => {
  const { data, error } = await supabase
    .from('presupuestos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PATCH /presupuesto/:id — actualizar estado
const ESTADOS_VALIDOS = ['pendiente', 'visto', 'en_proceso', 'completado'];

router.patch('/:id', requireAuth, async (req, res) => {
  const { estado } = req.body;
  if (!ESTADOS_VALIDOS.includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  const { data, error } = await supabase
    .from('presupuestos')
    .update({ estado })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;
