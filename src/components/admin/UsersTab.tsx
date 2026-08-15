import { useState, useEffect, useCallback } from 'react'
import { blink } from '@/blink/client'
import type { UserRole, UserRoleRecord } from '@/types'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Users, RefreshCw, Crown, Shield, Trash2 } from 'lucide-react'

const userRolesTable = blink.db.table<UserRoleRecord>('user_roles')

const ROLE_BADGE: Record<string, { label: string; className: string }> = {
  super_admin: { label: 'Super Admin', className: 'bg-neon-green/15 text-neon-green border-neon-green/30' },
  user_premium: { label: 'Premium', className: 'bg-premium-gold/15 text-premium-gold border-premium-gold/30' },
  user_free: { label: 'Gratuit', className: 'bg-muted/50 text-muted-foreground border-border' },
  club_pro: { label: 'Club Pro', className: 'bg-electric-blue/15 text-electric-blue border-electric-blue/30' },
}

function fmtDate(d: string | null | undefined): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function UsersTab() {
  const [users, setUsers] = useState<UserRoleRecord[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await userRolesTable.list()
      const subs = await blink.db.table('subscriptions').list().catch(() => [])

      // Auto-synchronize roles in database for users with active subscriptions
      for (const sub of subs) {
        if (sub.status === 'active' && sub.userId) {
          const userRec = data.find(u => u.userId === sub.userId)
          const isClubProPlan = sub.amount >= 100 || sub.plan === 'monthly' || sub.plan === 'quarterly'
          const expectedRole: UserRole = isClubProPlan ? 'club_pro' : 'user_premium'

          if (userRec && userRec.role !== expectedRole) {
            await userRolesTable.update(userRec.id, {
              role: expectedRole,
              premiumExpiresAt: sub.expiresAt,
            }).catch(() => {})
            userRec.role = expectedRole
            userRec.premiumExpiresAt = sub.expiresAt
          } else if (!userRec) {
            const newRec = await userRolesTable.create({
              userId: sub.userId,
              role: expectedRole,
              premiumExpiresAt: sub.expiresAt,
            }).catch(() => null)
            if (newRec) data.push(newRec)
          }
        }
      }

      setUsers([...data])
    } catch {
      toast.error('Erreur lors du chargement des utilisateurs')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const changeRole = async (record: UserRoleRecord, newRole: UserRole) => {
    const thirtyDays = new Date()
    thirtyDays.setDate(thirtyDays.getDate() + 30)
    const expiresAt = newRole === 'user_premium' || newRole === 'club_pro' ? thirtyDays.toISOString() : null
    try {
      await userRolesTable.update(record.id, {
        role: newRole,
        premiumExpiresAt: expiresAt,
        premiumPlan: newRole === 'user_premium' ? 'monthly' : null,
      })
      toast.success(`Rôle mis à jour : ${newRole.toUpperCase()}`)
      fetchUsers()
    } catch {
      toast.error('Erreur lors de la modification du rôle')
    }
  }

  const deleteUser = async (record: UserRoleRecord) => {
    if (!confirm('Supprimer définitivement cet utilisateur ?')) return
    try {
      await userRolesTable.delete(record.id)
      toast.success('Utilisateur supprimé')
      fetchUsers()
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-neon-green border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {users.length} utilisateur{users.length !== 1 ? 's' : ''} enregistré{users.length !== 1 ? 's' : ''}
        </p>
        <Button variant="outline" size="sm" onClick={fetchUsers} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" /> Actualiser
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Utilisateur</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Rôle actuel</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Expiration Premium</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Modifier le rôle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                  <Users className="mx-auto h-8 w-8 mb-2 opacity-40" />
                  Aucun utilisateur trouvé
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const badge = ROLE_BADGE[u.role] ?? ROLE_BADGE.user_free
                return (
                  <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">{u.userId}</span>
                      <span className={`ml-2 sm:hidden inline-block text-xs rounded-full border px-2 py-0.5 ${badge.className}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`inline-block text-xs rounded-full border px-2.5 py-0.5 font-medium ${badge.className}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {u.premiumExpiresAt ? (
                        <span className={new Date(u.premiumExpiresAt) < new Date() ? 'text-destructive' : 'text-neon-green'}>
                          {fmtDate(u.premiumExpiresAt)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={u.role}
                          onChange={(e) => changeRole(u, e.target.value as UserRole)}
                          className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:border-neon-green focus:outline-none cursor-pointer"
                        >
                          <option value="user_free">Compte Gratuit</option>
                          <option value="user_premium">Premium</option>
                          <option value="club_pro">Club Pro</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteUser(u)}
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Supprimer l'utilisateur"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
