<script>
  import { apiPost } from '$lib/api.js';
  import { PUBLIC_WA_NUMBER } from '$env/static/public';

  let form = {
    nombre: '', telefono: '', email: '',
    zona: '', servicio: '', inmueble: '', descripcion: ''
  };
  let enviado = false;
  let loading = false;
  let error = '';

  const servicios = [
    'Instalación eléctrica', 'Remodelación', 'Iluminación LED',
    'Panel eléctrico', 'Mantenimiento', 'Construcción menor', 'Otro'
  ];
  const inmuebles = ['Casa', 'Apartamento', 'Local comercial', 'Bodega', 'Oficina', 'Otro'];

  async function enviar() {
    error = '';
    if (!form.nombre || !form.telefono || !form.servicio) {
      error = 'Por favor completa nombre, teléfono y tipo de servicio.';
      return;
    }
    loading = true;
    try {
      await apiPost('/presupuesto', form);
      enviado = true;
      const msg = encodeURIComponent(
        `Hola! Acabo de enviar una solicitud de presupuesto.\n` +
        `Nombre: ${form.nombre}\n` +
        `Teléfono: ${form.telefono}\n` +
        `Servicio: ${form.servicio}`
      );
      window.open(`https://wa.me/${PUBLIC_WA_NUMBER}?text=${msg}`, '_blank');
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  function reset() {
    form = { nombre: '', telefono: '', email: '', zona: '', servicio: '', inmueble: '', descripcion: '' };
    enviado = false;
    error = '';
  }
</script>

<div class="page">
  <h1>Solicitar <span>Presupuesto</span></h1>
  <p class="sub">Completa el formulario y te contactamos en menos de 24 horas</p>

  {#if enviado}
    <div class="success">
      <span>✅</span>
      <h2>¡Solicitud enviada!</h2>
      <p>Nos pondremos en contacto contigo pronto.</p>
      <button class="btn-primary" on:click={reset}>Enviar otra solicitud</button>
    </div>
  {:else}
    <form class="form" on:submit|preventDefault={enviar}>
      <div class="row">
        <label>
          Nombre completo *
          <input bind:value={form.nombre} placeholder="Juan Pérez" required />
        </label>
        <label>
          Teléfono *
          <input bind:value={form.telefono} placeholder="8888-8888" required />
        </label>
      </div>

      <div class="row">
        <label>
          Correo electrónico
          <input bind:value={form.email} type="email" placeholder="juan@ejemplo.com" />
        </label>
        <label>
          Zona / Cantón
          <input bind:value={form.zona} placeholder="Ej: San José centro" />
        </label>
      </div>

      <div class="row">
        <label>
          Tipo de servicio *
          <select bind:value={form.servicio} required>
            <option value="">Selecciona...</option>
            {#each servicios as s}
              <option value={s}>{s}</option>
            {/each}
          </select>
        </label>
        <label>
          Tipo de inmueble
          <select bind:value={form.inmueble}>
            <option value="">Selecciona...</option>
            {#each inmuebles as i}
              <option value={i}>{i}</option>
            {/each}
          </select>
        </label>
      </div>

      <label class="full">
        Descripción del trabajo
        <textarea bind:value={form.descripcion} rows="4"
          placeholder="Describe qué necesitas hacer, medidas aproximadas, urgencia..."></textarea>
      </label>

      {#if error}<p class="error">{error}</p>{/if}

      <button type="submit" class="btn-primary" disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar solicitud'}
      </button>
    </form>
  {/if}
</div>

<style>
  .page { max-width: 700px; margin: 0 auto; padding: 3rem 2rem; }
  h1 { font-size: 2.5rem; font-weight: 900; margin-bottom: 0.5rem; }
  h1 span { color: #f0c000; }
  .sub { color: #888; margin-bottom: 2.5rem; }

  .form { display: flex; flex-direction: column; gap: 1.2rem; }
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; }
  @media (max-width: 580px) { .row { grid-template-columns: 1fr; } }

  label { display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.9rem; color: #bbb; }
  input, select, textarea {
    background: #111; border: 1px solid #333; color: #fff;
    border-radius: 8px; padding: 0.7rem; font-size: 1rem;
    font-family: inherit;
  }
  input:focus, select:focus, textarea:focus { outline: none; border-color: #f0c000; }
  select option { background: #111; }
  textarea { resize: vertical; }
  .full { width: 100%; }

  .btn-primary {
    background: #f0c000; color: #000; font-weight: 700;
    padding: 0.8rem 2rem; border-radius: 8px;
    border: none; cursor: pointer; font-size: 1rem;
    width: fit-content;
    transition: opacity 0.2s;
  }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

  .success {
    text-align: center; padding: 3rem;
    background: #111; border: 1px solid #333; border-radius: 12px;
  }
  .success span { font-size: 3rem; display: block; margin-bottom: 1rem; }
  .success h2 { color: #f0c000; margin-bottom: 0.5rem; }
  .success p { color: #888; margin-bottom: 1.5rem; }
  .error { color: #ff6b6b; font-size: 0.9rem; }
</style>
