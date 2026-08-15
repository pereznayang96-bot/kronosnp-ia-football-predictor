/**
 * useSupabaseAuth — Hook d'authentification Supabase.
 * Évite les écrans blancs : on affiche toujours un loader pendant la résolution
 * initiale de la session et on n'écrase jamais `isLoading` à `true` une fois
 * la session résolue (cycle token-refresh).
 */
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export interface SupabaseAuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useSupabaseAuth(): SupabaseAuthState {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Récupération immédiate de la session persistée (localStorage)
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setUser(data.session?.user ?? null)
      setIsLoading(false)
    })

    // Écoute des changements (login, logout, refresh token)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      // Important : on ne repasse isLoading à true qu'au tout début, jamais ici.
      setIsLoading(false)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  }
}

/** Helpers d'auth — wraps propres, gestion d'erreurs explicite */
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signUpWithEmail(email: string, password: string, displayName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName ?? null },
    },
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function signInWithGoogle(redirectTo?: string) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: redirectTo ?? `${window.location.origin}/` },
  })
  if (error) throw error
  return data
}
