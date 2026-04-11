<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { user, authModal, initAuth, signIn, signUp, signOut } from '$lib/auth.js';
  import { PUBLIC_WA_NUMBER } from '$env/static/public';

  let email = '';
  let password = '';
  let nombre = '';
  let error = '';
  let loading = false;
  let menuOpen = false;

  onMount(() => initAuth());

  // Cierra el menú al cambiar de página
  $: if ($page) menuOpen = false;

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

  <!-- Desktop links -->
  <div class="nav-links">
    <a href="/">Inicio</a>
    <a href="/portfolio">Portafolio</a>
    <a href="/presupuesto">Presupuesto</a>
    <a href="/calculadora">Calculadora</a>
  </div>

  <!-- Desktop auth -->
  <div class="nav-auth desktop-auth">
    {#if $user}
      <a href="/admin" class="btn-admin">Admin</a>
      <span class="user-name">{$user.user_metadata?.full_name || $user.email}</span>
      <button class="btn-out" on:click={signOut}>Salir</button>
    {:else}
      <button class="btn-login" on:click={() => authModal.set('login')}>Ingresar</button>
    {/if}
  </div>

  <!-- Hamburguesa -->
  <button
    class="hamburger"
    aria-label="Abrir menú"
    aria-expanded={menuOpen}
    on:click={() => menuOpen = !menuOpen}
  >
    <span class:open={menuOpen}></span>
    <span class:open={menuOpen}></span>
    <span class:open={menuOpen}></span>
  </button>
</nav>

<!-- ─── Menú mobile ────────────────────────────────────────── -->
{#if menuOpen}
  <div class="mobile-menu">
    <a href="/">Inicio</a>
    <a href="/portfolio">Portafolio</a>
    <a href="/presupuesto">Presupuesto</a>
    <a href="/calculadora">Calculadora</a>
    <div class="mobile-sep"></div>
    {#if $user}
      <a href="/admin" class="mobile-admin">Admin</a>
      <span class="mobile-user">{$user.user_metadata?.full_name || $user.email}</span>
      <button class="btn-out" on:click={signOut}>Salir</button>
    {:else}
      <button class="btn-login" on:click={() => { authModal.set('login'); menuOpen = false; }}>Ingresar</button>
    {/if}
  </div>
{/if}

<!-- ─── Contenido de la página ────────────────────────────── -->
<main>
  <slot />
</main>

<!-- ─── Modal de Auth ─────────────────────────────────────── -->
{#if $authModal}
  <div class="overlay" role="button" tabindex="0"
    on:click={e => e.target === e.currentTarget && authModal.set(null)}
    on:keydown={e => e.key === 'Escape' && authModal.set(null)}>
    <div class="modal" role="dialog" aria-modal="true">
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

<!-- ─── Footer ─────────────────────────────────────────────── -->
<footer>
  <div class="footer-inner">
    <span class="brand">⚡ Electro Rayo Remodelaciones</span>
    <div class="footer-links">
      <a href="/">Inicio</a>
      <a href="/portfolio">Portafolio</a>
      <a href="/presupuesto">Presupuesto</a>
      <a href="/calculadora">Calculadora</a>
    </div>
    <span class="copy">© {new Date().getFullYear()} Electro Rayo · Costa Rica</span>
  </div>
</footer>

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
  .btn-admin { background: #222; border: 1px solid #f0c000; color: #f0c000; font-size: 0.85rem; font-weight: 700; padding: 0.4rem 0.8rem; border-radius: 6px; }

  /* Hamburguesa */
  .hamburger {
    display: none;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    width: 36px; height: 36px;
    background: none;
    border-radius: 6px;
    padding: 4px;
  }
  .hamburger span {
    display: block;
    height: 2px;
    background: #f0f0f0;
    border-radius: 2px;
    transition: transform 0.2s, opacity 0.2s;
  }
  /* X cuando está abierto */
  .hamburger span:nth-child(1).open { transform: translateY(7px) rotate(45deg); }
  .hamburger span:nth-child(2).open { opacity: 0; }
  .hamburger span:nth-child(3).open { transform: translateY(-7px) rotate(-45deg); }

  @media (max-width: 700px) {
    .nav-links, .desktop-auth { display: none; }
    .hamburger { display: flex; }
  }

  /* Menú mobile desplegable */
  .mobile-menu {
    display: flex;
    flex-direction: column;
    background: #111;
    border-bottom: 1px solid #222;
    padding: 1rem 2rem;
    gap: 1rem;
    position: sticky;
    top: 58px;
    z-index: 99;
  }
  .mobile-menu a { font-size: 1rem; color: #f0f0f0; }
  .mobile-menu a:hover { color: #f0c000; }
  .mobile-admin { color: #f0c000 !important; font-weight: 700; }
  .mobile-sep { border-top: 1px solid #222; }
  .mobile-user { font-size: 0.85rem; color: #aaa; }

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

  /* Footer */
  footer {
    background: #111;
    border-top: 1px solid #222;
    padding: 2rem;
    margin-top: auto;
  }
  .footer-inner {
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
  }
  .footer-inner .brand { font-weight: 800; color: #f0c000; }
  .footer-links { display: flex; gap: 1.2rem; flex: 1; }
  .footer-links a { color: #888; font-size: 0.9rem; }
  .footer-links a:hover { color: #f0c000; }
  .copy { color: #555; font-size: 0.8rem; margin-left: auto; }
  @media (max-width: 600px) {
    .footer-inner { flex-direction: column; align-items: flex-start; gap: 0.8rem; }
    .copy { margin-left: 0; }
  }
</style>
