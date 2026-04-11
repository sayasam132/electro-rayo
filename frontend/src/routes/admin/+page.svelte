<script>
  import { onMount } from 'svelte';
  import { user, authModal } from '$lib/auth.js';
  import { supabase } from '$lib/supabase.js';

  let presupuestos = [];
  let loading = true;
  let error = '';

  const ESTADOS = ['pendiente', 'visto', 'en_proceso', 'completado'];

  const ESTADO_LABEL = {
    pendiente:   { label: 'Pendiente',   color: '#f0c000' },
    visto:       { label: 'Visto',       color: '#60a5fa' },
    en_proceso:  { label: 'En proceso',  color: '#fb923c' },
    completado:  { label: 'Completado',  color: '#4ade80' },
  };

  onMount(async () => {
    if (!$user) {
      authModal.set('login');
      loading = false;
      return;
    }
    await cargar();
  });

  async function cargar() {
    loading = true;
    error = '';
    const { data, error: err } = await supabase
      .from('presupuestos')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) error = err.message;
    else presupuestos = data;
    loading = false;
  }

  async function cambiarEstado(id, estado) {
    const { error: err } = await supabase
      .from('presupuestos')
      .update({ estado })
      .eq('id', id);
    if (err) error = err.message;
    else presupuestos = presupuestos.map(p => p.id === id ? { ...p, estado } : p);
  }

  function fmt(dateStr) {
    return new Date(dateStr).toLocaleDateString('es-CR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
</script>

<div class="page">
  <h1>Panel <span>Admin</span></h1>
  <p class="sub">Gestión de solicitudes de presupuesto</p>

  {#if !$user}
    <p class="hint">Debes iniciar sesión para acceder al panel.</p>
  {:else if loading}
    <p class="hint">Cargando...</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if presupuestos.length === 0}
    <p class="hint">No hay solicitudes aún.</p>
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

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Servicio</th>
            <th>Zona</th>
            <th>Inmueble</th>
            <th>Estado</th>
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
</div>

<style>
  .page { max-width: 1200px; margin: 0 auto; padding: 3rem 2rem; }
  h1 { font-size: 2.5rem; font-weight: 900; margin-bottom: 0.5rem; }
  h1 span { color: #f0c000; }
  .sub { color: #888; margin-bottom: 2.5rem; }
  .hint { color: #666; font-style: italic; }
  .error { color: #ff6b6b; }

  .stats {
    display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem;
  }
  .stat-card {
    background: #111; border: 1px solid #222; border-radius: 10px;
    padding: 1rem 1.5rem; display: flex; flex-direction: column;
    align-items: center; gap: 0.2rem; min-width: 100px;
  }
  .stat-num { font-size: 2rem; font-weight: 900; }
  .stat-label { font-size: 0.75rem; color: #666; text-transform: uppercase; letter-spacing: 0.05em; }

  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  thead tr { background: #1a1a1a; }
  th {
    padding: 0.8rem 1rem; text-align: left;
    color: #666; font-size: 0.75rem; text-transform: uppercase;
    letter-spacing: 0.05em; white-space: nowrap;
  }
  td { padding: 0.8rem 1rem; border-top: 1px solid #1a1a1a; vertical-align: middle; }
  tr:hover td { background: #111; }
  .date { color: #666; font-size: 0.8rem; white-space: nowrap; }
  td a { color: #f0c000; }

  select {
    background: #1a1a1a; border: 1px solid #333;
    border-radius: 6px; padding: 0.3rem 0.6rem;
    font-size: 0.85rem; cursor: pointer; font-weight: 600;
  }
  select:focus { outline: none; border-color: #f0c000; }
  select option { color: #fff; }

  .desc-row td {
    padding: 0.3rem 1rem 0.8rem;
    color: #888; font-size: 0.85rem;
    border-top: none;
  }
  .desc-label { color: #555; font-weight: 600; }
</style>
