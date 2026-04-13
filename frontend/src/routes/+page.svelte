<script>
  import { PUBLIC_WA_NUMBER } from '$env/static/public';
  const waLink = `https://wa.me/${PUBLIC_WA_NUMBER}?text=Hola%2C%20quiero%20un%20presupuesto`;
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

<section class="cta">
  <h2>¿Listo para empezar?</h2>
  <p>Contáctanos hoy y recibe tu presupuesto sin compromiso.</p>
  <a href="/presupuesto" class="btn-primary">Pedir presupuesto ahora</a>
</section>

<script context="module">
  const servicios = [
    { icon: '🔌', name: 'Instalaciones eléctricas', desc: 'Residencial y comercial. Paneles, tomacorrientes, iluminación.', slug: 'instalaciones-electricas' },
    { icon: '🏗️', name: 'Remodelaciones', desc: 'Cocinas, baños, paredes, pisos. Transformamos tu espacio.', slug: 'remodelaciones' },
    { icon: '💡', name: 'Iluminación LED', desc: 'Ahorra energía con soluciones LED modernas y eficientes.', slug: 'iluminacion-led' },
    { icon: '🔧', name: 'Mantenimiento', desc: 'Revisiones periódicas y reparaciones de emergencia.', slug: 'mantenimiento' },
    { icon: '📐', name: 'Diseño eléctrico', desc: 'Planos y cálculos para proyectos nuevos.', slug: 'diseno-electrico' },
    { icon: '🏠', name: 'Construcción menor', desc: 'Ampliaciones, cuartos, garajes y más.', slug: 'construccion-menor' },
  ];
</script>

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
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.5rem;
  }
  .card {
    background: #111;
    border: 1px solid #222;
    border-radius: 12px;
    padding: 1.5rem;
    transition: border-color 0.2s, transform 0.2s;
    text-decoration: none;
    color: inherit;
    display: block;
    cursor: pointer;
  }
  .card:hover { border-color: #f0c000; transform: translateY(-3px); }
  .icon { font-size: 2rem; display: block; margin-bottom: 0.5rem; }
  .card h3 { margin-bottom: 0.5rem; }
  .card p { color: #888; font-size: 0.9rem; line-height: 1.5; }

  .cta {
    text-align: center;
    padding: 4rem 2rem;
    background: #111;
    border-top: 1px solid #222;
  }
  .cta h2 { font-size: 1.8rem; color: #f0c000; margin-bottom: 1rem; }
  .cta p { color: #aaa; margin-bottom: 1.5rem; }
</style>
