<script>
  import { onMount } from 'svelte';
  import { user, authModal } from '$lib/auth.js';
  import { supabase } from '$lib/supabase.js';

  // ── Presupuestos ──────────────────────────────────────────────
  let presupuestos = [];
  let loadingP = true;
  let errorP = '';

  const ESTADOS = ['pendiente', 'visto', 'en_proceso', 'completado'];
  const ESTADO_LABEL = {
    pendiente:  { label: 'Pendiente',  color: '#f0c000' },
    visto:      { label: 'Visto',      color: '#60a5fa' },
    en_proceso: { label: 'En proceso', color: '#fb923c' },
    completado: { label: 'Completado', color: '#4ade80' },
  };

  // ── Galería ───────────────────────────────────────────────────
  const BUCKET = 'fotos-servicios';
  const SERVICIOS = [
    { slug: 'instalaciones-electricas', icon: '🔌', nombre: 'Instalaciones eléctricas' },
    { slug: 'remodelaciones',           icon: '🏗️', nombre: 'Remodelaciones' },
    { slug: 'iluminacion-led',          icon: '💡', nombre: 'Iluminación LED' },
    { slug: 'mantenimiento',            icon: '🔧', nombre: 'Mantenimiento' },
    { slug: 'diseno-electrico',         icon: '📐', nombre: 'Diseño eléctrico' },
    { slug: 'construccion-menor',       icon: '🏠', nombre: 'Construcción menor' },
  ];

  let galerias = SERVICIOS.map(s => ({ ...s, fotos: [], cargando: false, subiendo: false, errorG: '' }));
  let seccionActiva = 'presupuestos'; // 'presupuestos' | 'galeria'

  const ADMIN_EMAIL = 'sayasammejia2@gmail.com';

  onMount(async () => {
    if (!$user) { authModal.set('login'); loadingP = false; return; }
    if ($user.email !== ADMIN_EMAIL) { loadingP = false; return; }
    await cargarPresupuestos();
    await cargarTodasFotos();
  });

  // ── Presupuestos ──────────────────────────────────────────────
  async function cargarPresupuestos() {
    loadingP = true; errorP = '';
    const { data, error: err } = await supabase
      .from('presupuestos').select('*').order('created_at', { ascending: false });
    if (err) errorP = err.message;
    else presupuestos = data;
    loadingP = false;
  }

  async function cambiarEstado(id, estado) {
    const { error: err } = await supabase.from('presupuestos').update({ estado }).eq('id', id);
    if (err) errorP = err.message;
    else presupuestos = presupuestos.map(p => p.id === id ? { ...p, estado } : p);
  }

  function fmt(dateStr) {
    return new Date(dateStr).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // ── Galería ───────────────────────────────────────────────────
  function publicUrl(path) {
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  async function cargarFotos(slug) {
    const idx = galerias.findIndex(g => g.slug === slug);
    galerias[idx].cargando = true;
    const { data } = await supabase.storage.from(BUCKET).list(slug, { sortBy: { column: 'created_at', order: 'asc' } });
    galerias[idx].fotos = (data || [])
      .filter(f => f.name !== '.emptydir')
      .map(f => ({ src: publicUrl(`${slug}/${f.name}`), name: f.name, path: `${slug}/${f.name}` }));
    galerias[idx].cargando = false;
    galerias = [...galerias];
  }

  async function cargarTodasFotos() {
    await Promise.all(SERVICIOS.map(s => cargarFotos(s.slug)));
  }

  async function subirFotos(slug, files) {
    const idx = galerias.findIndex(g => g.slug === slug);
    galerias[idx].subiendo = true;
    galerias[idx].errorG = '';
    galerias = [...galerias];

    for (const file of files) {
      const ext = file.name.split('.').pop();
      const nombre = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: err } = await supabase.storage.from(BUCKET).upload(`${slug}/${nombre}`, file);
      if (err) { galerias[idx].errorG = err.message; break; }
    }

    galerias[idx].subiendo = false;
    galerias = [...galerias];
    await cargarFotos(slug);
  }

  async function borrarFoto(slug, path) {
    const { error: err } = await supabase.storage.from(BUCKET).remove([path]);
    if (!err) await cargarFotos(slug);
  }
</script>

<div class="page">
  <h1>Panel <span>Admin</span></h1>

  <!-- Tabs -->
  <div class="tabs">
    <button class:active={seccionActiva === 'presupuestos'} on:click={() => seccionActiva = 'presupuestos'}>
      📋 Presupuestos
    </button>
    <button class:active={seccionActiva === 'galeria'} on:click={() => seccionActiva = 'galeria'}>
      🖼️ Galería de fotos
    </button>
  </div>

  {#if !$user}
    <p class="hint">Debes iniciar sesión para acceder al panel.</p>
  {:else if $user.email !== ADMIN_EMAIL}
    <p class="error">Acceso denegado.</p>

  <!-- ── PRESUPUESTOS ── -->
  {:else if seccionActiva === 'presupuestos'}
    {#if loadingP}
      <p class="hint">Cargando...</p>
    {:else if errorP}
      <p class="error">{errorP}</p>
    {:else}
      <div class="stats">
        {#each ESTADOS as e}
          {@const count = presupuestos.filter(p => p.estado === e).length}
          <div class="stat-card">
            <span class="stat-num" style="color:{ESTADO_LABEL[e].color}">{count}</span>
            <span class="stat-label">{ESTADO_LABEL[e].label}</span>
          </div>
        {/each}
      </div>

      {#if presupuestos.length === 0}
        <p class="hint">No hay solicitudes aún.</p>
      {:else}
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th><th>Nombre</th><th>Teléfono</th>
                <th>Servicio</th><th>Zona</th><th>Inmueble</th><th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {#each presupuestos as p}
                <tr>
                  <td class="date">{fmt(p.created_at)}</td>
                  <td><strong>{p.nombre}</strong></td>
                  <td><a href="tel:{p.telefono}">{p.telefono}</a></td>
                  <td>{p.servicio}</td>
                  <td>{p.zona || '—'}</td>
                  <td>{p.inmueble || '—'}</td>
                  <td>
                    <select
                      value={p.estado}
                      on:change={e => cambiarEstado(p.id, e.target.value)}
                      style="color:{ESTADO_LABEL[p.estado]?.color || '#fff'}"
                    >
                      {#each ESTADOS as est}
                        <option value={est}>{ESTADO_LABEL[est].label}</option>
                      {/each}
                    </select>
                  </td>
                </tr>
                {#if p.descripcion}
                  <tr class="desc-row">
                    <td colspan="7"><span class="desc-label">Descripción:</span> {p.descripcion}</td>
                  </tr>
                {/if}
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    {/if}

  <!-- ── GALERÍA ── -->
  {:else}
    <div class="galerias">
      {#each galerias as g}
        <div class="galeria-bloque">
          <div class="galeria-header">
            <h3>{g.icon} {g.nombre}</h3>
            <label class="btn-upload" class:disabled={g.subiendo}>
              {g.subiendo ? 'Subiendo...' : '+ Agregar fotos'}
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={g.subiendo}
                on:change={e => subirFotos(g.slug, Array.from(e.target.files))}
              />
            </label>
          </div>

          {#if g.errorG}<p class="error">{g.errorG}</p>{/if}

          {#if g.cargando}
            <p class="hint">Cargando...</p>
          {:else if g.fotos.length === 0}
            <p class="sin-fotos">Sin fotos aún. Sube la primera.</p>
          {:else}
            <div class="fotos-grid">
              {#each g.fotos as foto}
                <div class="foto-card">
                  <img src={foto.src} alt={foto.name} loading="lazy" />
                  <button class="btn-borrar" on:click={() => borrarFoto(g.slug, foto.path)} title="Eliminar">✕</button>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .page { max-width: 1200px; margin: 0 auto; padding: 3rem 2rem; }
  h1 { font-size: 2.5rem; font-weight: 900; margin-bottom: 1.5rem; }
  h1 span { color: #f0c000; }
  .hint { color: #666; font-style: italic; }
  .error { color: #ff6b6b; }

  /* Tabs */
  .tabs { display: flex; gap: 0.5rem; margin-bottom: 2rem; border-bottom: 1px solid #222; padding-bottom: 0; }
  .tabs button {
    background: none; border: none; color: #666; font-size: 1rem;
    padding: 0.7rem 1.4rem; cursor: pointer; border-bottom: 2px solid transparent;
    margin-bottom: -1px; transition: color 0.2s;
  }
  .tabs button:hover { color: #fff; }
  .tabs button.active { color: #f0c000; border-bottom-color: #f0c000; }

  /* Stats */
  .stats { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem; }
  .stat-card {
    background: #111; border: 1px solid #222; border-radius: 10px;
    padding: 1rem 1.5rem; display: flex; flex-direction: column;
    align-items: center; gap: 0.2rem; min-width: 100px;
  }
  .stat-num { font-size: 2rem; font-weight: 900; }
  .stat-label { font-size: 0.75rem; color: #666; text-transform: uppercase; letter-spacing: 0.05em; }

  /* Tabla */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  thead tr { background: #1a1a1a; }
  th { padding: 0.8rem 1rem; text-align: left; color: #666; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }
  td { padding: 0.8rem 1rem; border-top: 1px solid #1a1a1a; vertical-align: middle; }
  tr:hover td { background: #111; }
  .date { color: #666; font-size: 0.8rem; white-space: nowrap; }
  td a { color: #f0c000; }
  select { background: #1a1a1a; border: 1px solid #333; border-radius: 6px; padding: 0.3rem 0.6rem; font-size: 0.85rem; cursor: pointer; font-weight: 600; }
  select:focus { outline: none; border-color: #f0c000; }
  select option { color: #fff; }
  .desc-row td { padding: 0.3rem 1rem 0.8rem; color: #888; font-size: 0.85rem; border-top: none; }
  .desc-label { color: #555; font-weight: 600; }

  /* Galería */
  .galerias { display: flex; flex-direction: column; gap: 2.5rem; }
  .galeria-bloque { background: #0d0d0d; border: 1px solid #1e1e1e; border-radius: 12px; padding: 1.5rem; }
  .galeria-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem; flex-wrap: wrap; gap: 0.8rem; }
  .galeria-header h3 { font-size: 1.1rem; color: #f0c000; margin: 0; }

  .btn-upload {
    background: #f0c000; color: #000; font-weight: 700;
    padding: 0.5rem 1.1rem; border-radius: 8px;
    font-size: 0.9rem; cursor: pointer; transition: opacity 0.2s;
  }
  .btn-upload:hover { opacity: 0.85; }
  .btn-upload.disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-upload input { display: none; }

  .sin-fotos { color: #444; font-style: italic; font-size: 0.9rem; }

  .fotos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.8rem; margin-top: 0.5rem; }
  .foto-card { position: relative; border-radius: 8px; overflow: hidden; border: 1px solid #222; }
  .foto-card img { width: 100%; aspect-ratio: 4/3; object-fit: cover; display: block; }
  .btn-borrar {
    position: absolute; top: 4px; right: 4px;
    background: rgba(0,0,0,0.75); border: none; color: #ff6b6b;
    border-radius: 50%; width: 24px; height: 24px;
    font-size: 0.75rem; cursor: pointer; line-height: 1;
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.2s;
  }
  .foto-card:hover .btn-borrar { opacity: 1; }
</style>
