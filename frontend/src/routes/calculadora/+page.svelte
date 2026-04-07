<script>
  let items = [
    { nombre: 'Tomacorriente doble', qty: 0, precio: 15000 },
    { nombre: 'Interruptor sencillo', qty: 0, precio: 8000 },
    { nombre: 'Interruptor doble', qty: 0, precio: 12000 },
    { nombre: 'Luminaria LED 12W', qty: 0, precio: 18000 },
    { nombre: 'Luminaria LED 18W', qty: 0, precio: 25000 },
    { nombre: 'Punto eléctrico nuevo', qty: 0, precio: 35000 },
    { nombre: 'Breaker 15A', qty: 0, precio: 12000 },
    { nombre: 'Breaker 20A', qty: 0, precio: 14000 },
    { nombre: 'Cambio de panel 100A', qty: 0, precio: 250000 },
    { nombre: 'Metro de cableado', qty: 0, precio: 3500 },
  ];

  $: subtotal = items.reduce((acc, i) => acc + i.qty * i.precio, 0);
  $: manoObra = subtotal * 0.35;
  $: total = subtotal + manoObra;

  function fmt(n) {
    return '₡' + Math.round(n).toLocaleString('es-CR');
  }

  function reset() {
    items = items.map(i => ({ ...i, qty: 0 }));
  }
</script>

<div class="page">
  <h1>Calculadora de <span>Presupuesto</span></h1>
  <p class="sub">Estimación orientativa — el precio final puede variar según inspección</p>

  <div class="layout">
    <div class="items-table">
      <div class="table-header">
        <span>Material / Trabajo</span>
        <span>Precio unit.</span>
        <span>Cantidad</span>
        <span>Subtotal</span>
      </div>
      {#each items as item}
        <div class="table-row">
          <span>{item.nombre}</span>
          <span class="price">{fmt(item.precio)}</span>
          <div class="qty-ctrl">
            <button on:click={() => item.qty = Math.max(0, item.qty - 1)}>−</button>
            <span>{item.qty}</span>
            <button on:click={() => item.qty++}>+</button>
          </div>
          <span class="price">{item.qty > 0 ? fmt(item.qty * item.precio) : '—'}</span>
        </div>
      {/each}
    </div>

    <div class="resumen">
      <h2>Resumen</h2>
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
      <p class="nota">* Precios en colones costarricenses. Incluye materiales e instalación.</p>

      <a href="/presupuesto" class="btn-primary">Solicitar presupuesto real</a>
      <button class="btn-reset" on:click={reset}>Limpiar</button>
    </div>
  </div>
</div>

<style>
  .page { max-width: 1100px; margin: 0 auto; padding: 3rem 2rem; }
  h1 { font-size: 2.5rem; font-weight: 900; margin-bottom: 0.5rem; }
  h1 span { color: #f0c000; }
  .sub { color: #888; margin-bottom: 2.5rem; }

  .layout { display: grid; grid-template-columns: 1fr 300px; gap: 2rem; align-items: start; }
  @media (max-width: 750px) { .layout { grid-template-columns: 1fr; } }

  .items-table { background: #111; border: 1px solid #222; border-radius: 12px; overflow: hidden; }
  .table-header, .table-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    padding: 0.8rem 1rem;
    gap: 0.5rem;
    align-items: center;
  }
  .table-header {
    background: #1a1a1a;
    font-size: 0.8rem;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .table-row { border-top: 1px solid #1a1a1a; }
  .table-row:hover { background: #151515; }
  .price { color: #f0c000; font-family: monospace; }

  .qty-ctrl { display: flex; align-items: center; gap: 0.5rem; }
  .qty-ctrl button {
    width: 28px; height: 28px;
    background: #222; border: 1px solid #333; color: #fff;
    border-radius: 6px; cursor: pointer; font-size: 1rem;
    display: flex; align-items: center; justify-content: center;
  }
  .qty-ctrl button:hover { background: #f0c000; color: #000; border-color: #f0c000; }
  .qty-ctrl span { min-width: 24px; text-align: center; font-family: monospace; }

  .resumen {
    background: #111; border: 1px solid #333;
    border-radius: 12px; padding: 1.5rem;
    display: flex; flex-direction: column; gap: 0.8rem;
    position: sticky; top: 80px;
  }
  .resumen h2 { color: #f0c000; margin-bottom: 0.5rem; }
  .linea { display: flex; justify-content: space-between; color: #bbb; }
  .linea.total {
    border-top: 1px solid #333; padding-top: 0.8rem;
    color: #fff; font-size: 1.1rem;
  }
  .linea.total strong { color: #f0c000; font-size: 1.3rem; }
  .nota { font-size: 0.75rem; color: #555; line-height: 1.4; }

  .btn-primary {
    display: block; text-align: center;
    background: #f0c000; color: #000; font-weight: 700;
    padding: 0.8rem; border-radius: 8px; font-size: 1rem;
    transition: opacity 0.2s;
  }
  .btn-primary:hover { opacity: 0.85; }
  .btn-reset {
    background: #222; border: 1px solid #333; color: #aaa;
    padding: 0.6rem; border-radius: 8px; cursor: pointer;
    font-size: 0.9rem;
  }
  .btn-reset:hover { background: #333; }
</style>
