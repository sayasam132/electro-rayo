<script>
  import { onMount } from 'svelte';
  import { user, authModal } from '$lib/auth.js';
  import { apiGet, apiPost, apiDelete } from '$lib/api.js';

  let comments = [];
  let newComment = '';
  let loading = false;
  let error = '';

  const proyectos = [
    { img: '🏠', title: 'Remodelación cocina - San José', desc: 'Cambio completo de instalación eléctrica e iluminación LED.' },
    { img: '🔌', title: 'Panel eléctrico - Heredia', desc: 'Sustitución de panel de 100A a 200A con breakers nuevos.' },
    { img: '💡', title: 'Iluminación comercial - Alajuela', desc: 'Instalación de 80 luminarias LED en bodega industrial.' },
    { img: '🏗️', title: 'Ampliación - Cartago', desc: 'Construcción de cuarto extra con instalación eléctrica completa.' },
    { img: '🔧', title: 'Mantenimiento - San Carlos', desc: 'Revisión y reparación de sistema eléctrico residencial.' },
    { img: '📐', title: 'Proyecto nuevo - Limón', desc: 'Diseño y ejecución eléctrica para casa de 200m².' },
  ];

  onMount(async () => {
    try {
      comments = await apiGet('/comments');
    } catch (e) {
      error = 'No se pudieron cargar los comentarios.';
    }
  });

  async function submitComment() {
    if (!$user) {
      authModal.set('login');
      return;
    }
    if (!newComment.trim()) return;
    loading = true;
    error = '';
    try {
      const c = await apiPost('/comments', { text: newComment.trim() });
      comments = [c, ...comments];
      newComment = '';
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  async function deleteComment(id) {
    try {
      await apiDelete(`/comments/${id}`);
      comments = comments.filter(c => c.id !== id);
    } catch (e) {
      error = e.message;
    }
  }
</script>

<div class="page">
  <h1>Nuestro <span>Portafolio</span></h1>
  <p class="sub">Trabajos realizados con calidad y compromiso</p>

  <div class="grid">
    {#each proyectos as p}
      <div class="card">
        <div class="card-img">{p.img}</div>
        <h3>{p.title}</h3>
        <p>{p.desc}</p>
      </div>
    {/each}
  </div>

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

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 4rem;
  }
  .card { background: #111; border: 1px solid #222; border-radius: 12px; padding: 1.5rem; }
  .card:hover { border-color: #f0c000; }
  .card-img { font-size: 3rem; margin-bottom: 1rem; }
  .card h3 { margin-bottom: 0.5rem; color: #f0c000; }
  .card p { color: #888; font-size: 0.9rem; }

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
