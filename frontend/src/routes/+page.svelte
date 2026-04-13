<script>
  import { PUBLIC_WA_NUMBER } from '$env/static/public';
  const waLink = `https://wa.me/${PUBLIC_WA_NUMBER}?text=Hola%2C%20quiero%20un%20presupuesto`;

  let abierto = null;

  const servicios = [
    { icon: '🔌', name: 'Instalaciones eléctricas', desc: 'Residencial y comercial. Paneles, tomacorrientes, iluminación.', slug: 'instalaciones-electricas' },
    { icon: '🏗️', name: 'Remodelaciones', desc: 'Cocinas, baños, paredes, pisos. Transformamos tu espacio.', slug: 'remodelaciones' },
    { icon: '💡', name: 'Iluminación LED', desc: 'Ahorra energía con soluciones LED modernas y eficientes.', slug: 'iluminacion-led' },
    { icon: '🔧', name: 'Mantenimiento', desc: 'Revisiones periódicas y reparaciones de emergencia.', slug: 'mantenimiento' },
    { icon: '📐', name: 'Diseño eléctrico', desc: 'Planos y cálculos para proyectos nuevos.', slug: 'diseno-electrico' },
    { icon: '🏠', name: 'Construcción menor', desc: 'Ampliaciones, cuartos, garajes y más.', slug: 'construccion-menor' },
  ];

  const zonas = [
    { icon: '📍', provincia: 'Alajuela', cantones: 'Alajuela, San Ramón, Grecia, Atenas, Naranjo, Palmares' },
    { icon: '📍', provincia: 'San José', cantones: 'San José, Escazú, Desamparados, Goicoechea, Tibás' },
    { icon: '📍', provincia: 'Heredia', cantones: 'Heredia, San Pablo, Barva, Santo Domingo, Belén' },
    { icon: '📍', provincia: 'Cartago', cantones: 'Cartago, La Unión, Oreamuno, El Guarco' },
  ];

  const faqs = [
    { q: '¿Cuánto tarda en llegar el presupuesto?', a: 'Nos comunicamos en menos de 24 horas hábiles después de recibir tu solicitud.' },
    { q: '¿El presupuesto tiene algún costo?', a: 'No. El presupuesto es completamente gratuito y sin compromiso.' },
    { q: '¿Trabajan fines de semana?', a: 'Sí, atendemos emergencias eléctricas los 7 días de la semana.' },
    { q: '¿Tienen garantía en los trabajos?', a: 'Todos nuestros trabajos tienen garantía. El tiempo varía según el tipo de servicio.' },
    { q: '¿Qué formas de pago aceptan?', a: 'Aceptamos efectivo, SINPE Móvil y transferencia bancaria.' },
    { q: '¿Trabajan en zonas fuera del GAM?', a: 'Por el momento nos enfocamos en la Gran Área Metropolitana, pero puedes consultarnos.' },
  ];
</script>

<section class="hero">
  <div class="hero-content">
    <h1>⚡ Electro Rayo<br><span>Remodelaciones</span></h1>
    <p>Servicios eléctricos y de remodelación de confianza en Costa Rica.<br>
       Presupuesto gratis, trabajo garantizado.</p>
    <div class="hero-btns">
      <a href="/presupuesto" class="btn-primary">Solicitar presupuesto</a>
      <a href={waLink} target="_blank" class="btn-wa" rel="noopener noreferrer">WhatsApp</a>
    </div>
  </div>
</section>

<section class="servicios">
  <h2>Nuestros servicios</h2>
  <div class="grid">
    {#each servicios as s}
      <a class="card" href="/portfolio#{s.slug}">
        <span class="icon">{s.icon}</span>
        <h3>{s.name}</h3>
        <p>{s.desc}</p>
      </a>
    {/each}
  </div>
</section>

<section class="zonas">
  <h2>Zonas de cobertura</h2>
  <p class="zonas-sub">Atendemos en toda la Gran Área Metropolitana de Costa Rica</p>
  <div class="zonas-grid">
    {#each zonas as z}
      <div class="zona-card">
        <span class="zona-icon">{z.icon}</span>
        <div>
          <strong>{z.provincia}</strong>
          <p>{z.cantones}</p>
        </div>
      </div>
    {/each}
  </div>
</section>

<section class="faq">
  <h2>Preguntas frecuentes</h2>
  <div class="faq-list">
    {#each faqs as f, i}
      <div class="faq-item">
        <button class="faq-btn" on:click={() => abierto = abierto === i ? null : i}>
          <span>{f.q}</span>
          <span class="faq-arrow" class:open={abierto === i}>▼</span>
        </button>
        {#if abierto === i}
          <p class="faq-resp">{f.a}</p>
        {/if}
      </div>
    {/each}
  </div>
</section>

<section class="cta">
  <h2>¿Listo para empezar?</h2>
  <p>Contáctanos hoy y recibe tu presupuesto sin compromiso.</p>
  <a href="/presupuesto" class="btn-primary">Pedir presupuesto ahora</a>
</section>

<style>
  .hero {
    min-height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    background: radial-gradient(ellipse at top, #1a1200 0%, #0a0a0a 70%);
    padding: 4rem 2rem;
  }
  .hero h1 { font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 900; line-height: 1.1; }
  .hero h1 span { color: #f0c000; }
  .hero p { margin: 1.5rem auto; max-width: 500px; color: #bbb; font-size: 1.1rem; line-height: 1.6; }
  .hero-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 2rem; }

  .btn-primary {
    background: #f0c000; color: #000;
    padding: 0.8rem 2rem; border-radius: 8px;
    font-weight: 700; font-size: 1rem;
    transition: opacity 0.2s;
  }
  .btn-primary:hover { opacity: 0.85; }
  .btn-wa {
    background: #25d366; color: #fff;
    padding: 0.8rem 2rem; border-radius: 8px;
    font-weight: 700; font-size: 1rem;
    transition: opacity 0.2s;
  }
  .btn-wa:hover { opacity: 0.85; }

  .servicios { padding: 4rem 2rem; max-width: 1100px; margin: 0 auto; }
  .servicios h2 { font-size: 2rem; color: #f0c000; text-align: center; margin-bottom: 2.5rem; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; }
  .card {
    background: #111; border: 1px solid #222; border-radius: 12px; padding: 1.5rem;
    transition: border-color 0.2s, transform 0.2s;
    text-decoration: none; color: inherit; display: block; cursor: pointer;
  }
  .card:hover { border-color: #f0c000; transform: translateY(-3px); }
  .icon { font-size: 2rem; display: block; margin-bottom: 0.5rem; }
  .card h3 { margin-bottom: 0.5rem; }
  .card p { color: #888; font-size: 0.9rem; line-height: 1.5; }

  /* Zonas */
  .zonas { padding: 4rem 2rem; max-width: 1100px; margin: 0 auto; }
  .zonas h2 { font-size: 2rem; color: #f0c000; text-align: center; margin-bottom: 0.5rem; }
  .zonas-sub { text-align: center; color: #888; margin-bottom: 2rem; }
  .zonas-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
  .zona-card {
    background: #111; border: 1px solid #222; border-radius: 10px;
    padding: 1.2rem 1.5rem; display: flex; align-items: flex-start; gap: 0.8rem;
  }
  .zona-icon { font-size: 1.4rem; margin-top: 0.1rem; }
  .zona-card strong { color: #f0c000; display: block; margin-bottom: 0.3rem; }
  .zona-card p { color: #888; font-size: 0.85rem; line-height: 1.5; margin: 0; }

  /* FAQ */
  .faq { padding: 4rem 2rem; max-width: 800px; margin: 0 auto; }
  .faq h2 { font-size: 2rem; color: #f0c000; text-align: center; margin-bottom: 2rem; }
  .faq-list { display: flex; flex-direction: column; gap: 0.5rem; }
  .faq-item { background: #111; border: 1px solid #222; border-radius: 10px; overflow: hidden; }
  .faq-btn {
    width: 100%; display: flex; justify-content: space-between; align-items: center;
    padding: 1rem 1.2rem; background: none; border: none; color: #f0f0f0;
    font-size: 1rem; cursor: pointer; text-align: left; gap: 1rem;
  }
  .faq-btn:hover { background: #1a1a1a; }
  .faq-arrow { color: #f0c000; font-size: 0.8rem; transition: transform 0.2s; flex-shrink: 0; }
  .faq-arrow.open { transform: rotate(180deg); }
  .faq-resp { padding: 0 1.2rem 1rem; color: #aaa; font-size: 0.95rem; line-height: 1.6; }

  .cta {
    text-align: center; padding: 4rem 2rem;
    background: #111; border-top: 1px solid #222;
  }
  .cta h2 { font-size: 1.8rem; color: #f0c000; margin-bottom: 1rem; }
  .cta p { color: #aaa; margin-bottom: 1.5rem; }
</style>
