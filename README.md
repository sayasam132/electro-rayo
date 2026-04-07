# ⚡ Electro Rayo Remodelaciones

## Inicio rápido (local)

### 1. Supabase
1. Crear cuenta en https://supabase.com → New Project
2. Ir a **SQL Editor** → pegar y ejecutar `backend/supabase_setup.sql`
3. Ir a **Project Settings → API** y copiar las keys

### 2. Backend
```bash
cd backend
npm install
# Editar .env con tus keys de Supabase
npm run dev
# Corre en http://localhost:3001
```

### 3. Frontend
```bash
cd frontend
npm install --legacy-peer-deps
# Editar .env con tus keys de Supabase
npm run dev
# Corre en http://localhost:5173
```

---

## Variables de entorno

**backend/.env**
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
FRONTEND_URL=http://localhost:5173
PORT=3001
```

**frontend/.env**
```
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJ...
PUBLIC_API_URL=http://localhost:3001
PUBLIC_WA_NUMBER=506XXXXXXXX
```

---

## Estructura
```
electro-rayo/
├── backend/
│   ├── src/
│   │   ├── index.js
│   │   ├── supabase.js
│   │   ├── middleware/auth.js
│   │   └── routes/
│   │       ├── comments.js
│   │       ├── presupuesto.js
│   │       └── auth.js
│   ├── supabase_setup.sql
│   ├── .env           ← tus keys (no subir a git)
│   └── package.json
└── frontend/
    ├── src/
    │   ├── lib/
    │   │   ├── supabase.js
    │   │   ├── auth.js
    │   │   └── api.js
    │   └── routes/
    │       ├── +layout.svelte
    │       ├── +page.svelte
    │       ├── portfolio/+page.svelte
    │       ├── presupuesto/+page.svelte
    │       └── calculadora/+page.svelte
    ├── .env           ← tus keys (no subir a git)
    ├── svelte.config.js
    ├── vite.config.js
    └── package.json
```

## Endpoints del backend
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | /health | No | Health check |
| GET | /comments | No | Leer comentarios |
| POST | /comments | JWT | Publicar comentario |
| DELETE | /comments/:id | JWT | Borrar propio comentario |
| POST | /presupuesto | No | Enviar solicitud |
| GET | /presupuesto | Service role | Ver solicitudes (admin) |
| POST | /auth/register | No | Registrar usuario |
| GET | /auth/me | JWT | Ver perfil |
