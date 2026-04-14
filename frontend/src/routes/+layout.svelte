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
  <a href="/" class="brand">
    <img src="https://rptbfkwrrjhfpptmvlby.supabase.co/storage/v1/object/public/fotos-servicios/logo/logo.jpg" alt="Electro Rayo" class="logo-img" />
    <span>Electro Rayo</span>
  </a>

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
    <div class="footer-redes">
      <a href="https://www.facebook.com/Sayasamowo/about" target="_blank" rel="noopener noreferrer" class="red-social" title="Facebook">
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
      </a>
      <a href="https://www.instagram.com/sayasam_owo_/" target="_blank" rel="noopener noreferrer" class="red-social" title="Instagram">
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
      </a>
      <a href="https://www.tiktok.com/@sayasam.owo" target="_blank" rel="noopener noreferrer" class="red-social" title="TikTok">
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.78a4.85 4.85 0 01-1.01-.09z"/></svg>
      </a>
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
  .brand { font-size: 1.3rem; font-weight: 800; color: #f0c000; margin-right: auto; display: flex; align-items: center; gap: 0.6rem; }
  .logo-img { height: 40px; width: 40px; object-fit: contain; border-radius: 50%; }
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
  .footer-redes { display: flex; gap: 0.8rem; align-items: center; }
  .red-social { color: #666; transition: color 0.2s; display: flex; }
  .red-social:hover { color: #f0c000; }
  .copy { color: #555; font-size: 0.8rem; margin-left: auto; }
  @media (max-width: 600px) {
    .footer-inner { flex-direction: column; align-items: flex-start; gap: 0.8rem; }
    .copy { margin-left: 0; }
  }
</style>
