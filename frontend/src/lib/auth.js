import { writable } from 'svelte/store';
import { supabase } from './supabase.js';

export const user = writable(null);
export const authModal = writable(null); // 'login' | 'register' | null

// Inicializa sesión y escucha cambios
export async function initAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  user.set(session?.user ?? null);

  supabase.auth.onAuthStateChange((_event, session) => {
    user.set(session?.user ?? null);
  });
}

export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  authModal.set(null);
}

export async function signUp(email, password, nombre) {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: nombre } }
  });
  if (error) throw error;
  authModal.set(null);
}

export async function signOut() {
  await supabase.auth.signOut();
  user.set(null);
}
