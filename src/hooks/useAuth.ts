import { useState, useEffect, useCallback } from 'react';
import { blink } from '@/blink/client';
import type { BlinkUser } from '@blinkdotnew/sdk';
import type { UserRole, UserRoleRecord } from '@/types';

interface AuthState {
  user: BlinkUser | null;
  userRole: UserRole | null;
  roleRecord: UserRoleRecord | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const roleTable = blink.db.table<UserRoleRecord>('user_roles');

export function useAuth(): AuthState & {
  refreshRole: () => Promise<void>;
  setDevRole: (role: UserRole) => void;
  isPremium: boolean;
  isAdmin: boolean;
} {
  const [user, setUser] = useState<BlinkUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(() => {
    if (typeof window !== 'undefined') {
      const dev = localStorage.getItem('kronos_dev_role') as UserRole;
      if (dev) return dev;
      const prefStr = localStorage.getItem('kronos_user_pref');
      if (prefStr) {
        try {
          const parsed = JSON.parse(prefStr);
          if (parsed.accountType === 'club_pro') return 'club_pro';
        } catch {}
      }
    }
    return null;
  });
  const [roleRecord, setRoleRecord] = useState<UserRoleRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRole = useCallback(async (userId: string) => {
    try {
      // Check permanent admin account email
      const userPrefStr = typeof window !== 'undefined' ? localStorage.getItem('kronos_user_pref') : null;
      let prefEmail = '';
      if (userPrefStr) {
        try { prefEmail = JSON.parse(userPrefStr).email || ''; } catch {}
      }
      if (prefEmail === 'pereznayang96@gmail.com') {
        setUserRole('super_admin');
        if (typeof window !== 'undefined') localStorage.setItem('kronos_dev_role', 'super_admin');
        return;
      }

      // Check if a dev role override exists
      const devRole = localStorage.getItem('kronos_dev_role') as UserRole;
      if (devRole) {
        setUserRole(devRole);
        return;
      }

      const records = await roleTable.list({ where: { userId }, limit: 1 });
      if (records.length > 0) {
        const rec = records[0];
        setRoleRecord(rec);
        setUserRole(rec.role);

        // Check premium expiry
        if (rec.role === 'user_premium' && rec.premiumExpiresAt) {
          const now = new Date();
          const expires = new Date(rec.premiumExpiresAt);
          if (now > expires) {
            // Premium expired, demote to free
            await roleTable.update(rec.id, { role: 'user_free', premiumExpiresAt: null, premiumPlan: null });
            setUserRole('user_free');
            setRoleRecord(prev => prev ? { ...prev, role: 'user_free', premiumExpiresAt: null, premiumPlan: null } : null);
          }
        }
      } else {
        // First sign-in: create role record based on registration preference (e.g. club_pro)
        let initialRole: UserRole = 'user_free';
        try {
          const prefStr = localStorage.getItem('kronos_user_pref');
          if (prefStr) {
            const parsed = JSON.parse(prefStr);
            if (parsed.email === 'pereznayang96@gmail.com') {
              initialRole = 'super_admin';
            } else if (parsed.accountType === 'club_pro') {
              initialRole = 'club_pro';
            }
          }
        } catch {}

        const expiresAt = initialRole === 'club_pro' ? new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString() : null;
        const newRecord = await roleTable.create({ userId, role: initialRole, premiumExpiresAt: expiresAt });
        setRoleRecord(newRecord);
        setUserRole(initialRole);
      }
    } catch {
      setUserRole('user_free');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged(async (state) => {
      setUser(state.user);
      if (state.user) {
        if (state.user.email === 'pereznayang96@gmail.com') {
          setUserRole('super_admin');
          if (typeof window !== 'undefined') localStorage.setItem('kronos_dev_role', 'super_admin');
        } else {
          await fetchRole(state.user.id);
        }
      } else {
        // Demo / Guest mode: check permanent admin or kronos_dev_role
        const devRole = typeof window !== 'undefined' ? (localStorage.getItem('kronos_dev_role') as UserRole) : null;
        const prefStr = typeof window !== 'undefined' ? localStorage.getItem('kronos_user_pref') : null;
        let prefEmail = '';
        if (prefStr) {
          try { prefEmail = JSON.parse(prefStr).email || ''; } catch {}
        }

        if (prefEmail === 'pereznayang96@gmail.com' || devRole === 'super_admin') {
          setUserRole('super_admin');
        } else if (devRole) {
          setUserRole(devRole);
        } else {
          try {
            if (prefStr) {
              const parsed = JSON.parse(prefStr);
              if (parsed.accountType === 'club_pro') {
                setUserRole('club_pro');
              } else {
                setUserRole('user_free');
              }
            } else {
              setUserRole('user_free');
            }
          } catch {
            setUserRole('user_free');
          }
        }
        setRoleRecord(null);
      }
      if (!state.isLoading) setIsLoading(false);
    });
    return unsubscribe;
  }, [fetchRole]);

  const refreshRole = useCallback(async () => {
    if (user) await fetchRole(user.id);
  }, [user, fetchRole]);

  const setDevRole = useCallback((role: UserRole) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kronos_dev_role', role);
    }
    setUserRole(role);
  }, []);

  return {
    user,
    userRole,
    roleRecord,
    isLoading,
    isAuthenticated: !!user,
    refreshRole,
    setDevRole,
    isPremium: userRole === 'user_premium' || userRole === 'club_pro' || userRole === 'super_admin',
    isAdmin: userRole === 'super_admin',
  };
}
