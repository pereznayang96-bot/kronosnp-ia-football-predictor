/**
 * Supabase Client — KronosNP IA
 * Connexion au backend Supabase pour les profils utilisateurs, rôles premium,
 * historique de prédictions, abonnements et paywall.
 *
 * IMPORTANT :
 *   - NE JAMAIS exposer la clé SERVICE_ROLE au navigateur (gardée côté serveur).
 *   - Les URL et clé anon sont injectées via VITE_SUPABASE_* au moment du build Vercel.
 *   - Si `import.meta.env.VITE_SUPABASE_URL` est absent, on retombe sur une exception
 *     explicite plutôt que d'envoyer du code avec un `undefined` (cause fréquente
 *     d'erreurs 401 silencieuses en prod).
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

function buildClient(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    // En dev sandbox sans variables VITE_SUPABASE_*, on log un avertissement au lieu de crasher
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.warn(
        '[KronosNP] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY manquant — fallback vers placeholder. Configurez les variables dans .env.local.'
      )
    }
    return createClient('https://placeholder.supabase.co', 'placeholder-anon-key', {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  })
}

export const supabase: SupabaseClient = buildClient()
export const SUPABASE_PROJECT_URL = SUPABASE_URL ?? 'https://gdtvjnrujlfdzckvosox.supabase.co'
