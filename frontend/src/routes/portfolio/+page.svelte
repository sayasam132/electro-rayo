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
  let certFotos = [];
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
    // Cargar certificaciones
    const { data: certData } = await supabase.storage.from(BUCKET).list('certificaciones', { sortBy: { column: 'created_at', order: 'asc' } });
    certFotos = (certData || [])
      .filter(f => f.name !== '.emptydir')
      .map(f => ({ src: publicUrl(`certificaciones/${f.name}`), name: f.name }));
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

  <!-- Quiénes somos -->
  <div class="sobre-grid">
    <div class="sobre-texto">
      <div class="titulo-logo">
        <h2>Tu Electricista de Confianza en Alajuela</h2>
        <img src="https://rptbfkwrrjhfpptmvlby.supabase.co/storage/v1/object/public/fotos-servicios/logo/logo.jpg" alt="Electro Rayo logo" class="logo-sobre" />
      </div>
      <p>Electro Rayo nació de la pasión por resolver problemas eléctricos y mejorar espacios. Como electricista con años de experiencia en Alajuela, fundé esta empresa con un objetivo claro: ofrecer servicios de calidad a precios justos.</p>
      <p>Hoy trabajamos en hogares y negocios de toda la zona, desde una simple instalación de tomacorriente hasta remodelaciones completas. Lo que nos motiva es ver la satisfacción de nuestros clientes cuando ven su espacio transformado y funcionando perfectamente.</p>
      <p class="firma">— Samuel Mejía Saquic, Fundador y Electricista Principal</p>
    </div>
    <div class="por-que">
      <h2>¿Por qué elegirnos?</h2>
      <ul class="beneficios">
        <li>✅ <strong>Precios transparentes</strong> — Cotizaciones claras sin sorpresas</li>
        <li>✅ <strong>Garantía por escrito</strong> — 6 meses en instalaciones eléctricas</li>
        <li>✅ <strong>Puntualidad garantizada</strong> — Respetamos tu tiempo</li>
        <li>✅ <strong>Trabajo profesional</strong> — Herramientas adecuadas, resultados impecables</li>
        <li>✅ <strong>Cobertura local</strong> — Alajuela centro, La Guácima, San Antonio, Carrizal</li>
        <li>✅ <strong>Atención personalizada</strong> — Cada cliente es importante</li>
      </ul>
    </div>
  </div>

  <!-- Números -->
  <div class="numeros">
    <div class="numero-card"><span class="numero-val">⭐ 5</span><span class="numero-label">Estrellas de satisfacción</span></div>
    <div class="numero-card"><span class="numero-val">24/7</span><span class="numero-label">Emergencias atendidas</span></div>
    <div class="numero-card"><span class="numero-val">6m</span><span class="numero-label">Garantía escrita</span></div>
    <div class="numero-card"><span class="numero-val">5+</span><span class="numero-label">Zonas de cobertura</span></div>
    <div class="numero-card"><span class="numero-val">0%</span><span class="numero-label">Sorpresas en el precio</span></div>
  </div>

  <!-- Cómo trabajamos -->
  <h2 class="section-title">Cómo trabajamos</h2>
  <div class="proceso">
    <div class="paso"><span class="paso-num">1</span><span class="paso-icon">📱</span><strong>Contacto inicial</strong><p>Nos escribís por WhatsApp. Te respondemos en menos de 2 horas.</p></div>
    <div class="paso-sep">→</div>
    <div class="paso"><span class="paso-num">2</span><span class="paso-icon">📋</span><strong>Cotización gratis</strong><p>Visitamos tu lugar y te damos un presupuesto claro.</p></div>
    <div class="paso-sep">→</div>
    <div class="paso"><span class="paso-num">3</span><span class="paso-icon">📅</span><strong>Acordamos fecha</strong><p>Elegimos juntos el mejor día y hora.</p></div>
    <div class="paso-sep">→</div>
    <div class="paso"><span class="paso-num">4</span><span class="paso-icon">🔧</span><strong>Ejecutamos</strong><p>Llegamos puntuales, trabajamos y dejamos todo limpio.</p></div>
    <div class="paso-sep">→</div>
    <div class="paso"><span class="paso-num">5</span><span class="paso-icon">✅</span><strong>Garantía</strong><p>Entregamos garantía por escrito y seguimos disponibles.</p></div>
  </div>

  <!-- Misión y Visión -->
  <div class="mv-grid">
    <div class="mv-card">
      <span class="mv-icon">⚡</span>
      <h2>Misión</h2>
      <p>Brindar servicios de remodelación y trabajos eléctricos de calidad a familias y negocios de Alajuela, satisfaciendo sus necesidades de mejorar y renovar sus espacios. Nos comprometemos a trabajar con honestidad, puntualidad y precios accesibles, garantizando la satisfacción total de nuestros clientes.</p>
    </div>
    <div class="mv-card">
      <span class="mv-icon">🎯</span>
      <h2>Visión</h2>
      <p>Ser la empresa de remodelaciones más confiable y reconocida en Alajuela dentro de los próximos cinco años. Queremos expandir nuestros servicios a otras zonas del país y convertirnos en la primera opción cuando las personas piensen en remodelar sus hogares o negocios.</p>
    </div>
    <div class="mv-card">
      <span class="mv-icon">💡</span>
      <h2>Filosofía</h2>
      <p>No tomamos atajos. No usamos materiales de baja calidad. Cada instalación la hacemos pensando: "¿Dejaría esto en la casa de mi familia?" Si la respuesta es no, lo hacemos mejor.</p>
    </div>
    <div class="mv-card">
      <span class="mv-icon">🤝</span>
      <h2>Compromiso</h2>
      <p>Llegar puntual, explicar claramente el trabajo, usar materiales de calidad, dejar el área limpia y responder tus dudas con paciencia. Tu tranquilidad es nuestra prioridad.</p>
    </div>
  </div>

  <!-- Testimonios -->
  <h2 class="section-title">Lo que dicen nuestros clientes</h2>
  <div class="testimonios">
    <div class="testimonio"><p>"Samuel llegó puntual, explicó todo con claridad y dejó mi instalación eléctrica impecable. Recomendado 100%."</p><span>— María G., La Guácima</span></div>
    <div class="testimonio"><p>"Excelente trabajo en la pintura de mi casa. Profesionales y honestos con los precios."</p><span>— Carlos R., Alajuela Centro</span></div>
    <div class="testimonio"><p>"Resolvieron mi emergencia eléctrica un domingo. Servicio rápido y efectivo."</p><span>— Ana P., San Antonio</span></div>
  </div>

  <!-- Certificaciones -->
  <h2 class="section-title">Certificaciones y formación</h2>
  <div class="cert-seccion">
    {#if certFotos.length === 0}
      <p class="sin-fotos">Certificaciones próximamente...</p>
    {:else}
      <div class="cert-grid">
        {#each certFotos as foto}
          <div class="cert-card">
            <img src={foto.src} alt={foto.name} loading="lazy" />
          </div>
        {/each}
      </div>
    {/if}
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

  .titulo-logo { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; }
  .titulo-logo h2 { margin: 0; }
  .logo-sobre { width: 100px; height: 100px; object-fit: contain; flex-shrink: 0; }

  /* Sobre nosotros */
  .sobre-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 3rem; }
  @media (max-width: 700px) { .sobre-grid { grid-template-columns: 1fr; } }
  .sobre-texto h2, .por-que h2 { font-size: 1.4rem; color: #f0c000; margin-bottom: 1rem; }
  .sobre-texto p { color: #999; line-height: 1.8; margin-bottom: 0.8rem; font-size: 0.95rem; }
  .firma { color: #666 !important; font-style: italic; font-size: 0.85rem !important; }
  .por-que { background: #111; border: 1px solid #222; border-radius: 12px; padding: 1.5rem; }
  .beneficios { list-style: none; display: flex; flex-direction: column; gap: 0.6rem; }
  .beneficios li { color: #ccc; font-size: 0.9rem; line-height: 1.5; }

  /* Números */
  .numeros { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; margin-bottom: 3.5rem; }
  .numero-card {
    background: #111; border: 1px solid #222; border-radius: 12px;
    padding: 1.2rem 1.8rem; display: flex; flex-direction: column; align-items: center; gap: 0.3rem; flex: 1; min-width: 120px;
  }
  .numero-val { font-size: 2rem; font-weight: 900; color: #f0c000; }
  .numero-label { font-size: 0.75rem; color: #666; text-transform: uppercase; letter-spacing: 0.04em; text-align: center; }

  /* Proceso */
  .proceso { display: flex; align-items: flex-start; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 3.5rem; justify-content: center; }
  .paso { background: #111; border: 1px solid #222; border-radius: 12px; padding: 1.2rem; flex: 1; min-width: 130px; max-width: 160px; text-align: center; position: relative; }
  .paso-num { position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: #f0c000; color: #000; font-weight: 900; font-size: 0.75rem; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; }
  .paso-icon { font-size: 1.6rem; display: block; margin-bottom: 0.4rem; }
  .paso strong { display: block; color: #f0c000; font-size: 0.85rem; margin-bottom: 0.3rem; }
  .paso p { color: #888; font-size: 0.78rem; line-height: 1.4; margin: 0; }
  .paso-sep { color: #444; font-size: 1.5rem; margin-top: 2rem; }
  @media (max-width: 700px) { .paso-sep { display: none; } .paso { max-width: 100%; } }

  /* Testimonios */
  .testimonios { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 3.5rem; }
  .testimonio { background: #111; border: 1px solid #222; border-radius: 12px; padding: 1.5rem; }
  .testimonio p { color: #ccc; font-style: italic; line-height: 1.7; margin-bottom: 0.8rem; }
  .testimonio span { color: #f0c000; font-size: 0.85rem; font-weight: 600; }

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
  /* Certificaciones */
  .cert-seccion { margin-bottom: 3.5rem; }
  .cert-grid { display: flex; gap: 1.5rem; flex-wrap: wrap; }
  .cert-card {
    background: #111; border: 1px solid #333; border-radius: 12px;
    overflow: hidden; max-width: 340px;
    box-shadow: 0 4px 20px rgba(240,192,0,0.08);
  }
  .cert-card img { width: 100%; display: block; }

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
