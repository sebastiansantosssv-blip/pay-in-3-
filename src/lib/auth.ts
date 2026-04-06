import { supabase } from './supabase';

/**
 * Simulated OTP Auth
 * Uses Supabase email auth with phone number as pseudo-email.
 * Phone 3001234567 → 573001234567@payin3.local
 * This gives real Supabase sessions with proper RLS.
 * To swap to real SMS later, only this file needs to change.
 */

function phoneToEmail(phone: string): string {
  const clean = phone.replace(/\s/g, '');
  return `57${clean}@payin3.local`;
}

const DEFAULT_PASSWORD = 'payin3-mvp-2026';

export async function signUp(phone: string) {
  const email = phoneToEmail(phone);
  const { data, error } = await supabase.auth.signUp({
    email,
    password: DEFAULT_PASSWORD,
  });
  if (error) throw error;
  return data;
}

export async function signIn(phone: string) {
  const email = phoneToEmail(phone);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: DEFAULT_PASSWORD,
  });
  if (error) throw error;
  return data;
}

/** Simulated OTP verification — accepts any 6-digit code */
export async function verifyOTP(_phone: string, code: string): Promise<boolean> {
  if (code.length !== 6) return false;
  // In production, this would verify against Supabase/Twilio
  return true;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
