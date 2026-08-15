import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { BlinkClientBoundary } from '@/components/BlinkClientBoundary';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { blink } from '@/blink/client';
import {
  Sparkles, Mail, Lock, Eye, EyeOff, ShieldCheck,
  Crown, ArrowRight, User, LogIn, AlertCircle, Building2, Shield, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

export const Route = createFileRoute('/login')({
  head: () => ({
    meta: [
      { title: 'Connexion — KronosNP IA' },
      { name: 'description', content: 'Connectez-vous à votre espace KronosNP IA ou Club Pro pour accéder aux prédictions IA, scores exacts et au simulateur Mercato.' },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <BlinkClientBoundary
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-neon-green border-t-transparent" />
        </div>
      }
    >
      <LoginContent />
    </BlinkClientBoundary>
  );
}

function LoginContent() {
  const navigate = useNavigate();
  const { isAuthenticated, setDevRole, userRole } = useAuth();

  const [loginType, setLoginType] = useState<'utilisateur' | 'club_pro' | 'admin'>('utilisateur');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      if (userRole === 'club_pro') {
        navigate({ to: '/mercato' });
      } else if (userRole === 'super_admin') {
        navigate({ to: '/admin' });
      } else {
        navigate({ to: '/home' });
      }
    }
  }, [isAuthenticated, userRole, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Veuillez saisir une adresse email valide.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Veuillez saisir votre mot de passe.');
      return;
    }

    setLoading(true);

    try {
      // Check permanent hardcoded admin credentials
      let targetRole: UserRole = loginType === 'club_pro' ? 'club_pro' : loginType === 'admin' ? 'super_admin' : 'user_free';
      
      if (email.trim().toLowerCase() === 'pereznayang96@gmail.com') {
        if (password.trim() && password.trim() !== 'admin962026') {
          setErrorMsg('Mot de passe administrateur incorrect pour pereznayang96@gmail.com');
          setLoading(false);
          return;
        }
        targetRole = 'super_admin';
      }

      setDevRole(targetRole);

      // Save user email locally for persistent UI display
      localStorage.setItem('kronos_user_pref', JSON.stringify({
        email: email.trim().toLowerCase(),
        accountType: targetRole,
        loginTime: new Date().toISOString(),
      }));

      toast.success(
        targetRole === 'super_admin'
          ? `Connexion Super Administrateur réussie ! Bienvenue Perez Nayang.`
          : loginType === 'club_pro'
          ? `Connexion Espace Club Pro réussie ! Bienvenue (${email}).`
          : `Connexion réussie ! Bienvenue sur KronosNP IA.`
      );

      setTimeout(() => {
        if (targetRole === 'super_admin') {
          navigate({ to: '/admin' });
        } else if (targetRole === 'club_pro') {
          navigate({ to: '/mercato' });
        } else {
          navigate({ to: '/home' });
        }
      }, 600);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Identifiants incorrects ou problème de connexion.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFastLogin = (role: UserRole) => {
    if (role === 'super_admin') {
      setEmail('pereznayang96@gmail.com');
      setPassword('admin962026');
      setLoginType('admin');
      localStorage.setItem('kronos_user_pref', JSON.stringify({
        email: 'pereznayang96@gmail.com',
        accountType: 'super_admin',
        loginTime: new Date().toISOString(),
      }));
    }
    setDevRole(role);
    toast.success(`Accès activé en tant que : ${role === 'super_admin' ? 'Super Admin (Perez Nayang)' : role.toUpperCase()}`);
    if (role === 'club_pro') navigate({ to: '/mercato' });
    else if (role === 'super_admin') navigate({ to: '/admin' });
    else navigate({ to: '/home' });
  };

  const handleForgotPassword = () => {
    toast.info(`Un lien de réinitialisation de mot de passe sera envoyé à : ${email || 'votre adresse email'}`);
  };

  return (
    <div className="min-h-dvh bg-background text-foreground flex flex-col justify-between selection:bg-neon-green selection:text-background">
      
      {/* NAVBAR */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur z-20">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 h-16">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-neon-green" />
            <span className="font-display text-xl font-bold text-foreground">
              KronosNP<span className="text-neon-green"> IA</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:inline">Vous n'avez pas de compte ?</span>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-neon-green bg-neon-green/10 border border-neon-green/30 px-3.5 py-1.5 rounded-xl hover:bg-neon-green/20 transition-all"
            >
              S'inscrire <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex items-center justify-center p-4 py-12 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-neon-green/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-electric-blue/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md space-y-6 relative z-10">
          
          {/* LOGIN CARD */}
          <div className="rounded-3xl border border-border/60 bg-card/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            {/* CARD HEADER */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-neon-green/30 bg-neon-green/10 px-3 py-1 text-xs font-bold text-neon-green">
                <LogIn className="h-3.5 w-3.5" /> Authentification Sécurisée
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Connexion à <span className="text-neon-green">KronosNP IA</span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Accédez à vos prédictions, scores exacts et votre espace de travail.
              </p>
            </div>

            {/* LOGIN TYPE TABS */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-muted/30 border border-border/40">
              <button
                type="button"
                onClick={() => setLoginType('utilisateur')}
                className={cn(
                  'py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer',
                  loginType === 'utilisateur'
                    ? 'bg-neon-green text-background shadow-glow-neon'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <User className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Utilisateur</span>
              </button>

              <button
                type="button"
                onClick={() => setLoginType('club_pro')}
                className={cn(
                  'py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer',
                  loginType === 'club_pro'
                    ? 'bg-electric-blue text-white shadow-lg'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Club Pro</span>
              </button>

              <button
                type="button"
                onClick={() => setLoginType('admin')}
                className={cn(
                  'py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer',
                  loginType === 'admin'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Shield className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Admin</span>
              </button>
            </div>

            {/* ERROR BANNER */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-xs font-medium flex items-center gap-2.5 animate-shake">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* EMAIL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>Adresse Email</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Requis</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      loginType === 'club_pro'
                        ? 'staff@club-football.com'
                        : loginType === 'admin'
                        ? 'admin@kronosnp.ai'
                        : 'nom@exemple.com'
                    }
                    className="w-full rounded-xl border border-border bg-background/80 pl-10 pr-4 py-2.5 text-sm text-foreground focus:border-neon-green focus:outline-none focus:ring-1 focus:ring-neon-green transition-all"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">Mot de passe</label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[11px] font-semibold text-neon-green hover:underline cursor-pointer"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-border bg-background/80 pl-10 pr-10 py-2.5 text-sm text-foreground focus:border-neon-green focus:outline-none focus:ring-1 focus:ring-neon-green transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* REMEMBER ME */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-border text-neon-green focus:ring-neon-green h-4 w-4 cursor-pointer"
                  />
                  <span>Se souvenir de moi</span>
                </label>

                {loginType === 'club_pro' && (
                  <span className="text-[10px] font-bold text-electric-blue flex items-center gap-1">
                    <Crown className="h-3 w-3" /> Espace Staff & Scout
                  </span>
                )}
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  'w-full rounded-xl py-3 text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer',
                  loginType === 'club_pro'
                    ? 'bg-electric-blue text-white hover:bg-electric-blue/90'
                    : loginType === 'admin'
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-neon-green text-background hover:shadow-glow-neon'
                )}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>
                      {loginType === 'club_pro'
                        ? 'Se connecter à l\'Espace Club Pro'
                        : loginType === 'admin'
                        ? 'Se connecter à l\'Espace Admin'
                        : 'Se connecter'}
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* DEMO / FAST TEST LOGINS */}
            <div className="pt-4 border-t border-border/40 space-y-2">
              <p className="text-[11px] font-semibold text-muted-foreground text-center">
                Mode Démonstration & Test Rapide :
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleDemoFastLogin('user_free')}
                  className="px-2 py-1.5 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/50 text-[10px] font-bold text-foreground text-center cursor-pointer truncate"
                >
                  👤 Utilisateur
                </button>
                <button
                  onClick={() => handleDemoFastLogin('club_pro')}
                  className="px-2 py-1.5 rounded-lg border border-electric-blue/40 bg-electric-blue/10 hover:bg-electric-blue/20 text-[10px] font-bold text-electric-blue text-center cursor-pointer truncate"
                >
                  ⚽ Club Pro
                </button>
                <button
                  onClick={() => handleDemoFastLogin('super_admin')}
                  className="px-2 py-1.5 rounded-lg border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-[10px] font-bold text-purple-400 text-center cursor-pointer truncate"
                >
                  🛡️ Super Admin
                </button>
              </div>
            </div>

          </div>

          {/* FOOTER TEXT */}
          <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-neon-green" />
            <span>Paiements & Données sécurisés par KronosNP IA</span>
          </div>

        </div>
      </main>

    </div>
  );
}
