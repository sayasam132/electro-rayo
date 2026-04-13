<script>
  const categorias = [
    {
      nombre: 'Instalaciones eléctricas',
      items: [
        { nombre: 'Tomacorriente doble',       precio: 15000 },
        { nombre: 'Tomacorriente GFCI (baño)', precio: 22000 },
        { nombre: 'Interruptor sencillo',       precio: 8000  },
        { nombre: 'Interruptor doble',          precio: 12000 },
        { nombre: 'Punto eléctrico nuevo',      precio: 35000 },
        { nombre: 'Metro de cableado',          precio: 3500  },
      ]
    },
    {
      nombre: 'Paneles y breakers',
      items: [
        { nombre: 'Breaker 15A',             precio: 12000  },
        { nombre: 'Breaker 20A',             precio: 14000  },
        { nombre: 'Breaker 30A (A/C)',       precio: 18000  },
        { nombre: 'Cambio de panel 100A',    precio: 250000 },
        { nombre: 'Cambio de panel 200A',    precio: 380000 },
        { nombre: 'Tierra física (varilla)', precio: 45000  },
      ]
    },
    {
      nombre: 'Iluminación',
      items: [
        { nombre: 'Luminaria LED 12W',        precio: 18000 },
        { nombre: 'Luminaria LED 18W',        precio: 25000 },
        { nombre: 'Lámpara de techo (inst.)', precio: 12000 },
        { nombre: 'Reflector exterior LED',   precio: 35000 },
        { nombre: 'Tira LED por metro',       precio: 8000  },
      ]
    },
    {
      nombre: 'Remodelaciones',
      items: [
        { nombre: 'Pared de Durock (m²)',     precio: 25000  },
        { nombre: 'Repello fino (m²)',         precio: 18000  },
        { nombre: 'Porcelanato (m²)',          precio: 22000  },
        { nombre: 'Cielo raso (m²)',           precio: 20000  },
        { nombre: 'Pintura cuarto completo',   precio: 85000  },
        { nombre: 'Instalación puerta',        precio: 55000  },
      ]
    },
  ];

  // Estado reactivo: qty por ítem (clave: "catIdx-itemIdx")
  let qtys = {};

  function qty(ci, ii) { return qtys[`${ci}-${ii}`] || 0; }
  function setQty(ci, ii, v) { qtys = { ...qtys, [`${ci}-${ii}`]: Math.max(0, v) }; }

  $: lineas = categorias.flatMap((cat, ci) =>
    cat.items
      .map((item, ii) => ({ ...item, qty: qty(ci, ii), ci, ii }))
      .filter(l => l.qty > 0)
  );
  $: subtotal  = lineas.reduce((a, l) => a + l.qty * l.precio, 0);
  $: manoObra  = subtotal * 0.35;
  $: total     = subtotal + manoObra;

  function fmt(n) { return '₡' + Math.round(n).toLocaleString('es-CR'); }
  function reset() { qtys = {}; }
</script>

<div class="page">
  <h1>Calculadora de <span>Presupuesto</span></h1>
  <p class="sub">Estimación orientativa — el precio final puede variar según inspección en sitio</p>

  <div class="layout">
    <div class="items-col">
      {#each categorias as cat, ci}
        <div class="categoria">
          <h3>{cat.nombre}</h3>
          {#each cat.items as item, ii}
            <div class="row" class:activo={qty(ci,ii) > 0}>
              <span class="item-nombre">{item.nombre}</span>
              <span class="item-precio">{fmt(item.precio)}</span>
              <div class="qty-ctrl">
                <button on:click={() => setQty(ci, ii, qty(ci,ii) - 1)}>−</button>
                <span>{qty(ci,ii)}</span>
                <button on:click={() => setQty(ci, ii, qty(ci,ii) + 1)}>+</button>
              </div>
              <span class="item-sub">{qty(ci,ii) > 0 ? fmt(qty(ci,ii) * item.precio) : '—'}</span>
            </div>
          {/each}
        </div>
      {/each}
    </div>

    <div class="resumen">
      <h2>Resumen</h2>

      {#if lineas.length === 0}
        <p class="empty">Agrega ítems para ver el estimado</p>
      {:else}
        <div class="lineas-list">
          {#each lineas as l}
            <div class="linea-mini">
              <span>{l.nombre} ×{l.qty}</span>
              <span>{fmt(l.qty * l.precio)}</span>
            </div>
          {/each}
        </div>
        <div class="separador"></div>
      {/if}

      <div class="linea">
        <span>Materiales</span>
        <strong>{fmt(subtotal)}</strong>
      </div>
      <div class="linea">
        <span>Mano de obra (35%)</span>
        <strong>{fmt(manoObra)}</strong>
      </div>
      <div class="linea total">
        <span>TOTAL ESTIMADO</span>
        <strong>{fmt(total)}</strong>
      </div>
      <p class="nota">* Precios en colones. Incluye materiales e instalación.</p>

      <a href="/presupuesto" class="btn-primary">Solicitar presupuesto real</a>
      <button class="btn-reset" on:click={reset}>Limpiar todo</button>
    </div>
  </div>
</div>

<style>
  .page { max-width: 1200px; margin: 0 auto; padding: 3rem 2rem; }
  h1 { font-size: 2.5rem; font-weight: 900; margin-bottom: 0.5rem; }
  h1 span { color: #f0c000; }
  .sub { color: #888; margin-bottom: 2.5rem; }

  .layout { display: grid; grid-template-columns: 1fr 300px; gap: 2rem; align-items: start; }
  @media (max-width: 800px) { .layout { grid-template-columns: 1fr; } }

  .items-col { display: flex; flex-direction: column; gap: 1.5rem; }
  .categoria { background: #111; border: 1px solid #222; border-radius: 12px; overflow: hidden; }
  .categoria h3 {
    padding: 0.8rem 1rem; background: #1a1a1a;
    font-size: 0.85rem; color: #f0c000; text-transform: uppercase; letter-spacing: 0.05em;
  }
  .row {
    display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
    padding: 0.7rem 1rem; gap: 0.5rem; align-items: center;
    border-top: 1px solid #1a1a1a;
  }
  .row:hover { background: #151515; }
  .row.activo { background: #141000; }
  .item-nombre { font-size: 0.9rem; }
  .item-precio { color: #666; font-family: monospace; font-size: 0.85rem; }
  .item-sub { color: #f0c000; font-family: monospace; font-size: 0.85rem; text-align: right; }

  .qty-ctrl { display: flex; align-items: center; gap: 0.4rem; }
  .qty-ctrl button {
    width: 26px; height: 26px; background: #222; border: 1px solid #333; color: #fff;
    border-radius: 6px; cursor: pointer; font-size: 1rem;
    display: flex; align-items: center; justify-content: center;
  }
  .qty-ctrl button:hover { background: #f0c000; color: #000; border-color: #f0c000; }
  .qty-ctrl span { min-width: 20px; text-align: center; font-family: monospace; font-size: 0.9rem; }

  .resumen {
    background: #111; border: 1px solid #333; border-radius: 12px; padding: 1.5rem;
    display: flex; flex-direction: column; gap: 0.8rem; position: sticky; top: 80px;
  }
  .resumen h2 { color: #f0c000; margin-bottom: 0.3rem; }
  .empty { color: #555; font-style: italic; font-size: 0.9rem; }

  .lineas-list { display: flex; flex-direction: column; gap: 0.3rem; max-height: 200px; overflow-y: auto; }
  .linea-mini { display: flex; justify-content: space-between; font-size: 0.8rem; color: #888; }
  .linea-mini span:last-child { color: #f0c000; }
  .separador { border-top: 1px solid #222; margin: 0.2rem 0; }

  .linea { display: flex; justify-content: space-between; color: #bbb; font-size: 0.95rem; }
  .linea.total {
    border-top: 1px solid #333; padding-top: 0.8rem;
    color: #fff; font-size: 1.1rem;
  }
  .linea.total strong { color: #f0c000; font-size: 1.3rem; }
  .nota { font-size: 0.75rem; color: #555; line-height: 1.4; }

  .btn-primary {
    display: block; text-align: center; background: #f0c000; color: #000;
    font-weight: 700; padding: 0.8rem; border-radius: 8px; font-size: 1rem;
    transition: opacity 0.2s;
  }
  .btn-primary:hover { opacity: 0.85; }
  .btn-reset {
    background: #222; border: 1px solid #333; color: #aaa;
    padding: 0.6rem; border-radius: 8px; cursor: pointer; font-size: 0.9rem;
  }
  .btn-reset:hover { background: #333; }
</style>
