import { PUBLIC_API_URL } from '$env/static/public';
import { supabase } from './supabase.js';

async function getHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = { 'Content-Type': 'application/json' };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return headers;
}

export async function apiGet(path) {
  const res = await fetch(`${PUBLIC_API_URL}${path}`, {
    headers: await getHeaders()
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Error del servidor');
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(`${PUBLIC_API_URL}${path}`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Error del servidor');
  return res.json();
}

export async function apiPatch(path, body) {
  const res = await fetch(`${PUBLIC_API_URL}${path}`, {
    method: 'PATCH',
    headers: await getHeaders(),
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Error del servidor');
  return res.json();
}

export async function apiDelete(path) {
  const res = await fetch(`${PUBLIC_API_URL}${path}`, {
    method: 'DELETE',
    headers: await getHeaders()
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Error del servidor');
  return res.json();
}
