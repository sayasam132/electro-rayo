<script>
  import { onMount } from 'svelte';
  import { user, authModal } from '$lib/auth.js';
  import { supabase } from '$lib/supabase.js';

  const BUCKET = 'fotos-servicios';

  const SERVICIOS = [
    { slug: 'instalaciones-electricas', icon: '🔌', nombre: 'Instalaciones eléctricas' },
    { slug: 'remodelaciones',           icon: '🏗️', nombre: 'Remodelaciones' },
    { slug: 'iluminacion-led',          icon: '💡', nombre: 'Iluminación LED' },
    { slug: 'mantenimiento',            icon: '🔧', nombre: 'Mantenimiento' },
    { slug: 'diseno-electrico',         icon: '📐', nombre: 'Diseño eléctrico' },
    { slug: 'construccion-menor',       icon: '🏠', nombre: 'Construcción menor' },
  ];

  let galerias = SERVICIOS.map(s => ({ ...s, fotos: [], cargando: true }));
  let reviews = [];
  let newReview = '';
  let newRating = 5;
  let loading = false;
  let error = '';

  function publicUrl(path) {
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  async function cargarFotos() {
    galerias = await Promise.all(
      SERVICIOS.map(async (s) => {
        const { data } = await supabase.storage.from(BUCKET).list(s.slug, { sortBy: { column: 'created_at', order: 'asc' } });
        const fotos = (data || [])
          .filter(f => f.name !== '.emptydir')
          .map(f => ({ src: publicUrl(`${s.slug}/${f.name}`), name: f.name }));
        return { ...s, fotos, cargando: false };
      })
    );
  }

  onMount(async () => {
    cargarFotos();
    const { data, error: err } = await supabase
      .from('reviews')
      .select('id, user_id, user_name, rating, text, created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    if (err) error = 'No se pudieron cargar las reseñas.';
    else reviews = data;
  });

  async function submitReview() {
    if (!$user) { authModal.set('login'); return; }
    if (!newReview.trim()) return;
    loading = true;
    error = '';
    try {
      const user_name = $user.user_metadata?.full_name || $user.email?.split('@')[0] || 'Anónimo';
      const { data, error: err } = await supabase
        .from('reviews')
        .insert({ user_id: $user.id, user_name, rating: newRating, text: newReview.trim() })
        .select()
        .single();
      if (err) throw new Error(err.message);
      reviews = [data, ...reviews];
      newReview = '';
      newRating = 5;
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  async function deleteReview(id) {
    const { error: err } = await supabase
      .from('reviews').delete().eq('id', id).eq('user_id', $user.id);
    if (err) error = err.message;
    else reviews = reviews.filter(r => r.id !== id);
  }

  function stars(n) { return '★'.repeat(n) + '☆'.repeat(5 - n); }
  $: avgRating = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : null;
</script>

<div class="page">
  <h1>Nuestro <span>Portafolio</span></h1>
  <p class="sub">Trabajos realizados con calidad y compromiso</p>

  <!-- Misión y Visión -->
  <div class="mv-grid">
    <div class="mv-card">
      <span class="mv-icon">⚡</span>
      <h2>Misión</h2>
      <p>Brindar servicios de instalaciones eléctricas y remodelaciones de alta calidad a familias y negocios de Alajuela, garantizando seguridad, profesionalismo y precios justos. Nos comprometemos a resolver las necesidades de nuestros clientes con puntualidad, honestidad y trabajo garantizado, construyendo relaciones de confianza a largo plazo.</p>
    </div>
    <div class="mv-card">
      <span class="mv-icon">🎯</span>
      <h2>Visión</h2>
      <p>Ser la empresa de servicios eléctricos y remodelaciones más confiable y reconocida en Alajuela dentro de los próximos cinco años, expandiendo nuestros servicios a otras zonas del Valle Central y siendo la primera opción que las personas recuerdan cuando necesitan mejorar sus hogares o negocios.</p>
    </div>
  </div>

  <h2 class="section-title">Proyectos realizados</h2>

  {#each galerias as g}
    <section class="galeria-seccion" id={g.slug}>
      <h3 class="galeria-titulo"><span>{g.icon}</span> {g.nombre}</h3>
      {#if g.cargando}
        <p class="sin-fotos">Cargando...</p>
      {:else if g.fotos.length === 0}
        <p class="sin-fotos">Fotos próximamente...</p>
      {:else}
        <div class="fotos-grid">
          {#each g.fotos as foto}
            <div class="foto-card">
              <img src={foto.src} alt={foto.name} loading="lazy" />
            </div>
          {/each}
        </div>
      {/if}
    </section>
  {/each}

  <!-- Reseñas -->
  <section class="reviews-section">
    <div class="reviews-header">
      <h2>Reseñas de clientes</h2>
      {#if avgRating}
        <div class="avg-rating">
          <span class="avg-num">{avgRating}</span>
          <span class="avg-stars">{stars(Math.round(avgRating))}</span>
          <span class="avg-count">({reviews.length} reseña{reviews.length !== 1 ? 's' : ''})</span>
        </div>
      {/if}
    </div>

    <div class="review-form">
      <div class="star-selector">
        <span class="star-label">Tu puntuación:</span>
        {#each [1,2,3,4,5] as n}
          <button
            class="star-btn"
            class:active={newRating >= n}
            on:click={() => newRating = n}
            aria-label="{n} estrellas"
          >★</button>
        {/each}
      </div>
      <textarea
        bind:value={newReview}
        placeholder={$user ? 'Cuéntanos tu experiencia...' : 'Inicia sesión para dejar una reseña'}
        rows="3"
        maxlength="500"
      ></textarea>
      <button class="btn-primary" on:click={submitReview} disabled={loading}>
        {loading ? 'Publicando...' : 'Publicar reseña'}
      </button>
      {#if !$user}<p class="hint">👆 Al publicar se te pedirá iniciar sesión</p>{/if}
    </div>

    {#if error}<p class="error">{error}</p>{/if}

    <div class="reviews-list">
      {#if reviews.length === 0}
        <p class="empty">Sé el primero en dejar una reseña.</p>
      {:else}
        {#each reviews as r}
          <div class="review-card">
            <div class="review-top">
              <strong>{r.user_name}</strong>
              <span class="r-stars">{stars(r.rating)}</span>
              <span class="date">{new Date(r.created_at).toLocaleDateString('es-CR')}</span>
              {#if $user?.id === r.user_id}
                <button class="btn-delete" on:click={() => deleteReview(r.id)}>✕</button>
              {/if}
            </div>
            <p>{r.text}</p>
          </div>
        {/each}
      {/if}
    </div>
  </section>
</div>

<style>
  .page { max-width: 1100px; margin: 0 auto; padding: 3rem 2rem; }
  h1 { font-size: 2.5rem; font-weight: 900; margin-bottom: 0.5rem; }
  h1 span { color: #f0c000; }
  .sub { color: #888; margin-bottom: 3rem; }
  .section-title { font-size: 1.8rem; color: #f0c000; margin-bottom: 1.5rem; }

  .mv-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 4rem;
  }
  @media (max-width: 650px) { .mv-grid { grid-template-columns: 1fr; } }
  .mv-card {
    background: #111;
    border: 1px solid #222;
    border-radius: 12px;
    padding: 2rem;
    transition: border-color 0.2s;
  }
  .mv-card:hover { border-color: #f0c000; }
  .mv-icon { font-size: 2rem; display: block; margin-bottom: 0.8rem; }
  .mv-card h2 { color: #f0c000; font-size: 1.3rem; margin-bottom: 0.8rem; }
  .mv-card p { color: #999; font-size: 0.95rem; line-height: 1.7; }

  .galeria-seccion {
    margin-bottom: 3.5rem;
    scroll-margin-top: 80px;
  }
  .galeria-titulo {
    font-size: 1.4rem;
    color: #f0c000;
    margin-bottom: 1.2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border-bottom: 1px solid #222;
    padding-bottom: 0.6rem;
  }
  .sin-fotos {
    color: #555;
    font-style: italic;
    padding: 1rem 0;
  }
  .fotos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
  }
  .foto-card {
    background: #111;
    border: 1px solid #222;
    border-radius: 10px;
    overflow: hidden;
    transition: border-color 0.2s;
  }
  .foto-card:hover { border-color: #f0c000; }
  .foto-card img {
    width: 100%;
    aspect-ratio: 4/3;
    object-fit: cover;
    display: block;
  }

  .reviews-section { border-top: 1px solid #222; padding-top: 3rem; }
  .reviews-header { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
  .reviews-header h2 { font-size: 1.6rem; color: #f0c000; }
  .avg-rating { display: flex; align-items: center; gap: 0.5rem; }
  .avg-num { font-size: 1.8rem; font-weight: 900; color: #f0c000; }
  .avg-stars { color: #f0c000; font-size: 1.1rem; }
  .avg-count { color: #666; font-size: 0.85rem; }

  .review-form { display: flex; flex-direction: column; gap: 0.8rem; margin-bottom: 2rem; }
  .star-selector { display: flex; align-items: center; gap: 0.3rem; }
  .star-label { color: #888; font-size: 0.9rem; margin-right: 0.3rem; }
  .star-btn {
    background: none; border: none; font-size: 1.6rem;
    color: #333; cursor: pointer; transition: color 0.15s; line-height: 1;
  }
  .star-btn.active { color: #f0c000; }

  textarea {
    background: #111; border: 1px solid #333; color: #fff;
    border-radius: 8px; padding: 0.8rem; font-size: 1rem;
    resize: vertical; font-family: inherit;
  }
  textarea:focus { outline: none; border-color: #f0c000; }
  .btn-primary {
    background: #f0c000; color: #000; font-weight: 700;
    padding: 0.7rem 1.5rem; border-radius: 8px;
    border: none; cursor: pointer; font-size: 1rem;
    align-self: flex-start;
  }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .hint { color: #666; font-size: 0.85rem; }

  .reviews-list { display: flex; flex-direction: column; gap: 1rem; }
  .review-card { background: #111; border: 1px solid #222; border-radius: 8px; padding: 1rem; }
  .review-top { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.5rem; flex-wrap: wrap; }
  .review-top strong { color: #f0c000; }
  .r-stars { color: #f0c000; font-size: 0.95rem; }
  .date { color: #666; font-size: 0.8rem; margin-left: auto; }
  .btn-delete { background: none; border: none; color: #ff6b6b; cursor: pointer; font-size: 0.9rem; }
  .empty { color: #555; font-style: italic; }
  .error { color: #ff6b6b; font-size: 0.9rem; }
</style>
