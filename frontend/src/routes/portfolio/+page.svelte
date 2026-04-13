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
  let comments = [];
  let newComment = '';
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
      .from('comments')
      .select('id, user_id, user_name, text, created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    if (err) error = 'No se pudieron cargar los comentarios.';
    else comments = data;
  });

  async function submitComment() {
    if (!$user) { authModal.set('login'); return; }
    if (!newComment.trim()) return;
    loading = true;
    error = '';
    try {
      const user_name = $user.user_metadata?.full_name || $user.email?.split('@')[0] || 'Anónimo';
      const { data, error: err } = await supabase
        .from('comments')
        .insert({ user_id: $user.id, user_name, text: newComment.trim() })
        .select()
        .single();
      if (err) throw new Error(err.message);
      comments = [data, ...comments];
      newComment = '';
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  async function deleteComment(id) {
    const { error: err } = await supabase
      .from('comments')
      .delete()
      .eq('id', id)
      .eq('user_id', $user.id);
    if (err) error = err.message;
    else comments = comments.filter(c => c.id !== id);
  }
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

  <!-- Comentarios -->
  <section class="comments-section">
    <h2>Comentarios de clientes</h2>

    <div class="comment-form">
      <textarea
        bind:value={newComment}
        placeholder={$user ? 'Escribe tu comentario...' : 'Inicia sesión para comentar'}
        rows="3"
        maxlength="1000"
      ></textarea>
      <button class="btn-primary" on:click={submitComment} disabled={loading}>
        {loading ? 'Publicando...' : 'Publicar comentario'}
      </button>
      {#if !$user}
        <p class="hint">👆 Al publicar se te pedirá iniciar sesión</p>
      {/if}
    </div>

    {#if error}<p class="error">{error}</p>{/if}

    <div class="comments-list">
      {#if comments.length === 0}
        <p class="empty">Sé el primero en comentar.</p>
      {:else}
        {#each comments as c}
          <div class="comment">
            <div class="comment-header">
              <strong>{c.user_name}</strong>
              <span class="date">{new Date(c.created_at).toLocaleDateString('es-CR')}</span>
              {#if $user?.id === c.user_id}
                <button class="btn-delete" on:click={() => deleteComment(c.id)}>✕</button>
              {/if}
            </div>
            <p>{c.text}</p>
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

  .comments-section { border-top: 1px solid #222; padding-top: 3rem; }
  .comments-section h2 { font-size: 1.6rem; color: #f0c000; margin-bottom: 1.5rem; }

  .comment-form { display: flex; flex-direction: column; gap: 0.8rem; margin-bottom: 2rem; }
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

  .comments-list { display: flex; flex-direction: column; gap: 1rem; }
  .comment { background: #111; border: 1px solid #222; border-radius: 8px; padding: 1rem; }
  .comment-header { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.5rem; }
  .comment-header strong { color: #f0c000; }
  .date { color: #666; font-size: 0.8rem; margin-left: auto; }
  .btn-delete { background: none; border: none; color: #ff6b6b; cursor: pointer; font-size: 0.9rem; }
  .empty { color: #555; font-style: italic; }
  .error { color: #ff6b6b; font-size: 0.9rem; }
</style>
