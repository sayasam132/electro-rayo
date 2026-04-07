<script>
  import { onMount } from 'svelte';
  import { user, authModal, initAuth, signIn, signUp, signOut } from '$lib/auth.js';
  import { PUBLIC_WA_NUMBER } from '$env/static/public';

  let email = '';
  let password = '';
  let nombre = '';
  let error = '';
  let loading = false;

  onMount(() => initAuth());

  async function handleAuth() {
    error = '';
    loading = true;
    try {
      if ($authModal === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password, nombre);
      }
      email = password = nombre = '';
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  const waLink = `https://wa.me/${PUBLIC_WA_NUMBER}?text=Hola%2C%20quiero%20un%20presupuesto`;
</script>

<!-- ─── Navbar ─────────────────────────────────────────────── -->
<nav>
  <a href="/" class="brand">⚡ Electro Rayo</a>
  <div class="nav-links">
    <a href="/">Inicio</a>
    <a href="/portfolio">Portafolio</a>
    <a href="/presupuesto">Presupuesto</a>
    <a href="/calculadora">Calculadora</a>
  </div>
  <div class="nav-auth">
    {#if $user}
      <span class="user-name">{$user.user_metadata?.full_name || $user.email}</span>
      <button class="btn-out" on:click={signOut}>Salir</button>
    {:else}
      <button class="btn-login" on:click={() => authModal.set('login')}>Ingresar</button>
    {/if}
  </div>
</nav>

<!-- ─── Contenido de la página ────────────────────────────── -->
<main>
  <slot />
</main>

<!-- ─── Modal de Auth ─────────────────────────────────────── -->
{#if $authModal}
  <div class="overlay" on:click={() => authModal.set(null)}>
    <div class="modal" on:click|stopPropagation>
      <h2>{$authModal === 'login' ? 'Iniciar sesión' : 'Registrarse'}</h2>

      {#if $authModal === 'register'}
        <input bind:value={nombre} placeholder="Tu nombre" />
      {/if}
      <input bind:value={email} type="email" placeholder="Correo electrónico" />
      <input bind:value={password} type="password" placeholder="Contraseña" />

      {#if error}
        <p class="error">{error}</p>
      {/if}

      <button class="btn-primary" on:click={handleAuth} disabled={loading}>
        {loading ? 'Cargando...' : $authModal === 'login' ? 'Entrar' : 'Crear cuenta'}
      </button>

      <p class="switch">
        {#if $authModal === 'login'}
          ¿Sin cuenta? <button on:click={() => authModal.set('register')}>Regístrate</button>
        {:else}
          ¿Ya tienes cuenta? <button on:click={() => authModal.set('login')}>Inicia sesión</button>
        {/if}
      </p>

      <button class="close" on:click={() => authModal.set(null)}>✕</button>
    </div>
  </div>
{/if}

<!-- ─── WhatsApp flotante ──────────────────────────────────── -->
<a href={waLink} target="_blank" class="wa-float" rel="noopener noreferrer">
  💬
</a>

<style>
  :global(*, *::before, *::after) { box-sizing: border-box; margin: 0; padding: 0; }
  :global(body) { font-family: 'Segoe UI', sans-serif; background: #0a0a0a; color: #f0f0f0; }
  :global(a) { color: inherit; text-decoration: none; }

  nav {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.8rem 2rem;
    background: #111;
    border-bottom: 2px solid #f0c000;
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .brand { font-size: 1.3rem; font-weight: 800; color: #f0c000; margin-right: auto; }
  .nav-links { display: flex; gap: 1.2rem; }
  .nav-links a:hover { color: #f0c000; }
  .nav-auth { display: flex; align-items: center; gap: 0.8rem; }
  .user-name { font-size: 0.85rem; color: #aaa; }

  button { cursor: pointer; border: none; border-radius: 6px; }
  .btn-login { background: #f0c000; color: #000; font-weight: 700; padding: 0.4rem 1rem; }
  .btn-out { background: #333; color: #fff; padding: 0.4rem 0.8rem; font-size: 0.85rem; }

  main { min-height: calc(100vh - 60px); }

  /* Modal */
  .overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.7);
    display: flex; align-items: center; justify-content: center;
    z-index: 200;
  }
  .modal {
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 12px;
    padding: 2rem;
    width: 340px;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    position: relative;
  }
  .modal h2 { color: #f0c000; margin-bottom: 0.5rem; }
  .modal input {
    padding: 0.7rem;
    border-radius: 6px;
    border: 1px solid #333;
    background: #0a0a0a;
    color: #fff;
    font-size: 1rem;
  }
  .btn-primary {
    background: #f0c000; color: #000; font-weight: 700;
    padding: 0.7rem; font-size: 1rem;
  }
  .btn-primary:disabled { opacity: 0.6; }
  .error { color: #ff6b6b; font-size: 0.85rem; }
  .switch { font-size: 0.85rem; color: #aaa; text-align: center; }
  .switch button { background: none; color: #f0c000; font-size: 0.85rem; text-decoration: underline; }
  .close {
    position: absolute; top: 0.8rem; right: 0.8rem;
    background: none; color: #aaa; font-size: 1.1rem;
  }

  /* WhatsApp float */
  .wa-float {
    position: fixed; bottom: 1.5rem; right: 1.5rem;
    width: 56px; height: 56px;
    background: #25d366;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.6rem;
    box-shadow: 0 4px 15px rgba(37,211,102,0.4);
    z-index: 150;
    transition: transform 0.2s;
  }
  .wa-float:hover { transform: scale(1.1); }
</style>
