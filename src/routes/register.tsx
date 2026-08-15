import { createFileRoute, Link } from '@tanstack/react-router';
import { BlinkClientBoundary } from '@/components/BlinkClientBoundary';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { blink } from '@/blink/client';
import {
  Sparkles, User, Mail, Lock, Phone, Globe, Trophy,
  Eye, EyeOff, CheckCircle2, ShieldCheck, Shield, ArrowRight,
  Sparkle, AlertCircle, LogIn, Crown, Building2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/register')({
  head: () => ({
    meta: [
      { title: 'Inscription — KronosNP IA' },
      { name: 'description', content: 'Créez votre compte KronosNP IA ou Club Pro pour accéder aux prédictions football IA, scores exacts et défis communautaires.' },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <BlinkClientBoundary
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-neon-green border-t-transparent" />
        </div>
      }
    >
      <RegisterContent />
    </BlinkClientBoundary>
  );
}

function RegisterContent() {
  const { isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // Account Type Selection & Club Pro fields
  const [accountType, setAccountType] = useState<'user_free' | 'club_pro'>('user_free');
  const [clubName, setClubName] = useState('');
  const [clubDivision, setClubDivision] = useState('d1');

  // Form Fields (7 fields + consents)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [favLeague, setFavLeague] = useState('ligue1');
  const [country, setCountry] = useState('CI');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isAuthenticated && typeof window !== 'undefined') {
      window.location.href = '/home';
    }
  }, [isAuthenticated]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (accountType === 'club_pro' && !clubName.trim()) {
      setErrorMsg('Veuillez saisir le nom de votre club / organisation.');
      return;
    }
    if (!fullName.trim()) {
      setErrorMsg('Veuillez saisir votre nom complet.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Veuillez saisir une adresse email valide.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Les mots de passe ne correspondent pas.');
      return;
    }
    if (!acceptTerms) {
      setErrorMsg('Vous devez accepter les conditions générales d\'utilisation.');
      return;
    }

    setLoading(true);

    try {
      // Store user preferences in localStorage for initial role assignment upon sign-in
      localStorage.setItem('kronos_user_pref', JSON.stringify({
        fullName,
        phone,
        favLeague,
        country,
        subscribeNewsletter,
        accountType,
        clubName: accountType === 'club_pro' ? clubName : undefined,
        clubDivision: accountType === 'club_pro' ? clubDivision : undefined,
      }));
      localStorage.setItem('kronos_dev_role', accountType);

      toast.success(
        accountType === 'club_pro'
          ? `Compte Club Pro (${clubName}) créé avec succès ! Bienvenue ${fullName}.`
          : `Compte créé avec succès ! Bienvenue ${fullName}.`
      );

      // Redirect to home dashboard
      setTimeout(() => {
        window.location.href = '/home';
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Une erreur est survenue lors de l\'inscription.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background text-foreground flex flex-col justify-between">
      {/* NAVBAR */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 h-16">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-neon-green" />
            <span className="font-display text-xl font-bold text-foreground">KronosNP<span className="text-neon-green"> IA</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">Déjà inscrit ?</span>
            <button
              onClick={() => blink.auth.login()}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-neon-green hover:underline px-3 py-1.5 cursor-pointer"
            >
              <LogIn className="h-4 w-4" /> Se Connecter
            </button>
          </div>
        </div>
      </nav>

      {/* REGISTRATION FORM SECTION */}
      <main className="mx-auto w-full max-w-4xl px-4 py-10 my-auto">
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* LEFT VALUE PROP COLUMN */}
          <div className="lg:col-span-5 space-y-6">
            {accountType === 'club_pro' ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-electric-blue/40 bg-electric-blue/15 px-3.5 py-1.5 text-xs font-bold text-electric-blue">
                <Crown className="h-4 w-4" /> Inscription Club Pro Privilège
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border border-neon-green/30 bg-neon-green/10 px-3.5 py-1.5 text-xs font-semibold text-neon-green">
                <Sparkle className="h-4 w-4" /> Inscription Gratuite
              </div>
            )}

            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              {accountType === 'club_pro' ? (
                <>Accès <span className="text-electric-blue">Club Pro</span> & Analyses Avancées</>
              ) : (
                <>Rejoignez l'élite de la <span className="text-neon-green">prédiction IA</span></>
              )}
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {accountType === 'club_pro'
                ? 'Créez le compte officiel de votre club / organisation pour accéder aux outils d\'analyse avancés et pronostics illimités.'
                : 'Créez votre compte membre en quelques secondes pour débloquer les pronostics 1N2, participer aux Défis hebdomadaires et suivre les bilans en temps réel.'}
            </p>

            <div className="space-y-4 pt-2">
              {[
                { title: 'IA Transparente & Certifiée', desc: 'Consultez les bilans statistiques vérifiés de nos modèles bayésiens.' },
                { title: accountType === 'club_pro' ? 'Rapports & Filtres Pro' : 'Défi Communautaire Hebdo', desc: accountType === 'club_pro' ? 'Visualisations haute précision adaptées aux clubs.' : 'Pronostiquez les grilles et gagnez des accès Premium gratuits.' },
                { title: 'Notifications & Value Bets', desc: 'Recevez les meilleures alertes cotes directement sur votre mobile.' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className={cn(
                    'p-1.5 rounded-full shrink-0 mt-0.5',
                    accountType === 'club_pro' ? 'bg-electric-blue/20 text-electric-blue' : 'bg-neon-green/20 text-neon-green'
                  )}>
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur">
              <div className="flex items-center gap-2 text-xs font-semibold text-premium-gold mb-1">
                <ShieldCheck className="h-4 w-4" /> Confidentialité Garantie
              </div>
              <p className="text-xs text-muted-foreground">
                Vos données sont strictement sécurisées. Pas de spams, désinscription en 1 clic.
              </p>
            </div>
          </div>

          {/* RIGHT FORM CARD */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-border/80 bg-card/90 p-6 md:p-8 shadow-2xl backdrop-blur">
              <h2 className="font-display text-2xl font-bold text-foreground mb-1">Créer un compte</h2>
              <p className="text-xs text-muted-foreground mb-6">Choisissez votre type de compte et remplissez les informations ci-dessous.</p>

              {errorMsg && (
                <div className="mb-6 flex items-center gap-2.5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                {/* ACCOUNT TYPE SELECTION */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-muted-foreground">Sélectionnez le rôle du compte *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAccountType('user_free')}
                      className={cn(
                        'flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer',
                        accountType === 'user_free'
                          ? 'border-neon-green bg-neon-green/10 text-neon-green ring-1 ring-neon-green/50 shadow-sm'
                          : 'border-border bg-background/60 text-muted-foreground hover:bg-muted/40'
                      )}
                    >
                      <User className="h-4 w-4" />
                      <span>Compte Gratuit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType('club_pro')}
                      className={cn(
                        'flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer',
                        accountType === 'club_pro'
                          ? 'border-electric-blue bg-electric-blue/15 text-electric-blue ring-1 ring-electric-blue/50 shadow-sm'
                          : 'border-border bg-background/60 text-muted-foreground hover:bg-muted/40'
                      )}
                    >
                      <Crown className="h-4 w-4 text-electric-blue" />
                      <span>Créer Club Pro</span>
                    </button>
                  </div>
                </div>

                {/* CLUB PRO SPECIFIC FIELDS */}
                {accountType === 'club_pro' && (
                  <div className="p-3.5 rounded-xl border border-electric-blue/30 bg-electric-blue/5 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-electric-blue mb-1">Nom du Club / Organisation *</label>
                        <div className="relative">
                          <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-electric-blue" />
                          <input
                            type="text"
                            required
                            value={clubName}
                            onChange={(e) => setClubName(e.target.value)}
                            placeholder="Ex: Paris FC / ASEC Mimosas"
                            className="w-full rounded-xl border border-electric-blue/40 bg-background/90 pl-10 pr-3.5 py-2.5 text-sm text-foreground focus:border-electric-blue focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-electric-blue mb-1">Division du Club / Niveau *</label>
                        <div className="relative">
                          <Shield className="absolute left-3.5 top-3 h-4 w-4 text-electric-blue" />
                          <select
                            value={clubDivision}
                            onChange={(e) => setClubDivision(e.target.value)}
                            className="w-full rounded-xl border border-electric-blue/40 bg-background/90 pl-10 pr-3.5 py-2.5 text-sm text-foreground focus:border-electric-blue focus:outline-none transition-colors cursor-pointer"
                          >
                            <option value="d1">Division 1 / Ligue Élite</option>
                            <option value="d2">Division 2 / Ligue Pro</option>
                            <option value="national">National / Semi-Pro</option>
                            <option value="academy">Centre de Formation / Académie</option>
                            <option value="amateur">Amateur / Régional</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* FIELD 1: Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">1. Nom Complet *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex: Jean Dupont"
                      className="w-full rounded-xl border border-border bg-background/80 pl-10 pr-3.5 py-2.5 text-sm text-foreground focus:border-neon-green focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* FIELD 2: Email */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">2. Adresse Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jean.dupont@email.com"
                      className="w-full rounded-xl border border-border bg-background/80 pl-10 pr-3.5 py-2.5 text-sm text-foreground focus:border-neon-green focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* FIELD 3: Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">3. Numéro de Téléphone (Mobile Money) *</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+225 07 00 00 00 00 / +33 6 00 00 00 00"
                      className="w-full rounded-xl border border-border bg-background/80 pl-10 pr-3.5 py-2.5 text-sm text-foreground focus:border-neon-green focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* FIELD 4 & 5: Passwords */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">4. Mot de passe *</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-border bg-background/80 pl-10 pr-10 py-2.5 text-sm text-foreground focus:border-neon-green focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">5. Confirmation mot de passe *</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-border bg-background/80 pl-10 pr-3.5 py-2.5 text-sm text-foreground focus:border-neon-green focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* FIELD 6 & 7: League & Country */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">6. Championnat</label>
                    <div className="relative">
                      <Trophy className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                      <select
                        value={favLeague}
                        onChange={(e) => setFavLeague(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background/80 pl-10 pr-3.5 py-2.5 text-sm text-foreground focus:border-neon-green focus:outline-none transition-colors cursor-pointer text-xs"
                      >
                        <optgroup label="🏆 Compétitions Internationales & Coupes d'Europe">
                          <option value="champions_league">UEFA Champions League</option>
                          <option value="europa_league">UEFA Europa League</option>
                          <option value="conference_league">UEFA Conference League</option>
                          <option value="caf_cl">CAF Champions League & Coupe de la Confédération</option>
                          <option value="copa_libertadores">Copa Libertadores & Sudamericana</option>
                          <option value="afc_cl">AFC Champions League (Asie)</option>
                          <option value="world_cup_qualif">Coupe du Monde & Qualificatifs FIFA</option>
                        </optgroup>
                        <optgroup label="🇫🇷 France (Toutes Divisions Pro & Amateurs)">
                          <option value="ligue1">Ligue 1 McDonald's (D1 Pro)</option>
                          <option value="ligue2">Ligue 2 BKT (D2 Pro)</option>
                          <option value="national1">National 1 (D3 Semi-Pro)</option>
                          <option value="national2">National 2 (D4 Amateurs / Réserves)</option>
                          <option value="national3">National 3 & Régional 1 (D5/D6 Amateurs)</option>
                        </optgroup>
                        <optgroup label="🏴󠁧󠁢󠁥ⁿ󠁧󠁢󠁥ⁿ󠁧󠁢󠁳─ Angleterre (Pyramide Complète)">
                          <option value="premier_league">Premier League (D1 Pro)</option>
                          <option value="championship">EFL Championship (D2 Pro)</option>
                          <option value="league_one">EFL League One (D3 Pro)</option>
                          <option value="league_two">EFL League Two (D4 Pro)</option>
                          <option value="national_league">National League & North/South (D5/D6 Semi-Pro)</option>
                        </optgroup>
                        <optgroup label="🇪🇸 Espagne (Toutes Divisions)">
                          <option value="la_liga">La Liga EA Sports (D1 Pro)</option>
                          <option value="la_liga2">La Liga Hypermotion (D2 Pro)</option>
                          <option value="primera_rfef">Primera RFEF (D3 Semi-Pro)</option>
                          <option value="segunda_rfef">Segunda RFEF & Tercera (D4/D5 Amateurs)</option>
                        </optgroup>
                        <optgroup label="🇮🇹 Italie (Pyramide Italienne)">
                          <option value="serie_a">Serie A Enilive (D1 Pro)</option>
                          <option value="serie_b">Serie BKT (D2 Pro)</option>
                          <option value="serie_c">Serie C NOW (D3 Pro - Girone A/B/C)</option>
                          <option value="serie_d">Serie D & Eccellenza (D4/D5 Amateurs)</option>
                        </optgroup>
                        <optgroup label="🇩🇪 Allemagne (Toutes Divisions)">
                          <option value="bundesliga">Bundesliga (D1 Pro)</option>
                          <option value="bundesliga2">2. Bundesliga (D2 Pro)</option>
                          <option value="3liga">3. Liga (D3 Pro)</option>
                          <option value="regionalliga">Regionalliga (D4 Semi-Pro - Nord/West/Südwest/etc.)</option>
                          <option value="oberliga">Oberliga (D5 Amateurs)</option>
                        </optgroup>
                        <optgroup label="🌍 Afrique (D1 Élite & D2 Inférieures)">
                          <option value="ci_d1">Côte d'Ivoire — Ligue 1 Lonaci (D1)</option>
                          <option value="ci_d2">Côte d'Ivoire — Ligue 2 (D2)</option>
                          <option value="sn_d1">Sénégal — Ligue 1 StarTimes (D1)</option>
                          <option value="sn_d2">Sénégal — Ligue 2 (D2)</option>
                          <option value="cm_d1">Cameroun — MTN Elite One (D1)</option>
                          <option value="cm_d2">Cameroun — MTN Elite Two (D2)</option>
                          <option value="ma_d1">Maroc — Botola Pro1 Inwi (D1)</option>
                          <option value="ma_d2">Maroc — Botola Pro2 (D2)</option>
                          <option value="dz_d1">Algérie — Ligue 1 Mobilis (D1)</option>
                          <option value="dz_d2">Algérie — Ligue 2 Amateur (D2)</option>
                          <option value="tn_d1">Tunisie — Ligue Professionnelle 1 (D1)</option>
                          <option value="tn_d2">Tunisie — Ligue Professionnelle 2 (D2)</option>
                          <option value="eg_d1">Égypte — Egyptian Premier League (D1)</option>
                          <option value="eg_d2">Égypte — Second Division (D2)</option>
                          <option value="cd_d1">RD Congo — Linafoot Ligue 1 (D1)</option>
                          <option value="cd_d2">RD Congo — Linafoot Ligue 2 (D2)</option>
                          <option value="ml_d1">Mali — Première Division (D1)</option>
                          <option value="bf_d1">Burkina Faso — Ligue 1 (D1)</option>
                          <option value="bj_d1">Bénin — Super Ligue Pro (D1)</option>
                          <option value="bj_d2">Bénin — Ligue 2 (D2)</option>
                          <option value="tg_d1">Togo — National Foot D1</option>
                          <option value="tg_d2">Togo — National Foot D2</option>
                          <option value="gn_d1">Guinée — Ligue 1 Pro (D1)</option>
                          <option value="ga_d1">Gabon — National Foot 1</option>
                          <option value="gh_d1">Ghana — Premier League (D1)</option>
                          <option value="gh_d2">Ghana — Division One (D2)</option>
                          <option value="ng_d1">Nigeria — NPFL (D1)</option>
                          <option value="ng_d2">Nigeria — NNL (D2)</option>
                          <option value="za_d1">Afrique du Sud — Betway Premiership (D1)</option>
                          <option value="za_d2">Afrique du Sud — Motsepe Championship (D2)</option>
                        </optgroup>
                        <optgroup label="🇵🇹 🇳🇱 🇹🇷 🇧🇪 Autres Championnats Européens">
                          <option value="liga_portugal">Portugal — Liga Portugal Betclic (D1)</option>
                          <option value="liga_portugal2">Portugal — Liga Portugal 2 (D2)</option>
                          <option value="eredivisie">Pays-Bas — Eredivisie (D1)</option>
                          <option value="eerste_divisie">Pays-Bas — Eerste Divisie (D2)</option>
                          <option value="jupiler_pro">Belgique — Jupiler Pro League (D1)</option>
                          <option value="challenger_pro">Belgique — Challenger Pro League (D2)</option>
                          <option value="super_lig">Turquie — Trendyol Süper Lig (D1)</option>
                          <option value="turkey_1lig">Turquie — 1. Lig (D2)</option>
                          <option value="scottish_prem">Écosse — Premiership & Championship (D1/D2)</option>
                          <option value="swiss_super">Suisse — Credit Suisse Super League (D1)</option>
                          <option value="austrian_bundesliga">Autriche — Admiral Bundesliga (D1)</option>
                          <option value="greek_super">Grèce — Super League 1 (D1)</option>
                        </optgroup>
                        <optgroup label="🌎 Amériques, Moyen-Orient & Asie">
                          <option value="brasileirao_a">Brésil — Brasileirão Série A (D1)</option>
                          <option value="brasileirao_b">Brésil — Série B (D2)</option>
                          <option value="argentina_lpf">Argentine — Liga Profesional (D1)</option>
                          <option value="argentina_pnat">Argentine — Primera Nacional (D2)</option>
                          <option value="mls">États-Unis / Canada — Major League Soccer (MLS)</option>
                          <option value="usl">États-Unis — USL Championship (D2)</option>
                          <option value="liga_mx">Mexique — Liga MX (D1)</option>
                          <option value="liga_expansion">Mexique — Liga de Expansión (D2)</option>
                          <option value="saudi_pro">Arabie Saoudite — Roshn Saudi League (D1)</option>
                          <option value="saudi_d1">Arabie Saoudite — First Division (D2)</option>
                          <option value="j_league">Japon — J1 & J2 League</option>
                          <option value="k_league">Corée du Sud — K League 1 & 2</option>
                          <option value="other_league">Autre Championnat / Division Inférieure</option>
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">7. Pays / Zone Résidence</label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background/80 pl-10 pr-3.5 py-2.5 text-sm text-foreground focus:border-neon-green focus:outline-none transition-colors cursor-pointer"
                      >
                        <optgroup label="Afrique de l'Ouest">
                          <option value="CI">Côte d'Ivoire (XOF)</option>
                          <option value="SN">Sénégal (XOF)</option>
                          <option value="BJ">Bénin (XOF)</option>
                          <option value="TG">Togo (XOF)</option>
                          <option value="ML">Mali (XOF)</option>
                          <option value="BF">Burkina Faso (XOF)</option>
                          <option value="GN">Guinée (GNF)</option>
                          <option value="GH">Ghana (GHS)</option>
                          <option value="NG">Nigéria (NGN)</option>
                          <option value="NE">Niger (XOF)</option>
                        </optgroup>
                        <optgroup label="Afrique Centrale">
                          <option value="CM">Cameroun (XAF)</option>
                          <option value="GA">Gabon (XAF)</option>
                          <option value="CG">Congo-Brazzaville (XAF)</option>
                          <option value="CD">RD Congo / RDC (CDF)</option>
                          <option value="TD">Tchad (XAF)</option>
                        </optgroup>
                        <optgroup label="Afrique du Nord">
                          <option value="MA">Maroc (MAD)</option>
                          <option value="DZ">Algérie (DZD)</option>
                          <option value="TN">Tunisie (TND)</option>
                          <option value="EG">Égypte (EGP)</option>
                        </optgroup>
                        <optgroup label="Europe">
                          <option value="FR">France (EUR)</option>
                          <option value="BE">Belgique (EUR)</option>
                          <option value="CH">Suisse (CHF)</option>
                          <option value="GB">Royaume-Uni (GBP)</option>
                          <option value="ES">Espagne (EUR)</option>
                          <option value="DE">Allemagne (EUR)</option>
                          <option value="EU">Autre Pays d'Europe</option>
                        </optgroup>
                        <optgroup label="Amériques & Reste du Monde">
                          <option value="CA">Canada (CAD)</option>
                          <option value="US">États-Unis (USD)</option>
                          <option value="OTHER">Autre Pays / Zone Internationale</option>
                        </optgroup>
                      </select>
                    </div>
                  </div>
                </div>

                {/* CONSENTS & CHECKBOXES */}
                <div className="space-y-2.5 pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-0.5 rounded border-border text-neon-green focus:ring-neon-green"
                    />
                    <span className="text-xs text-muted-foreground">
                      J'accepte les <Link to="/" className="underline text-foreground">Conditions Générales</Link> et atteste avoir au moins 18 ans. *
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={subscribeNewsletter}
                      onChange={(e) => setSubscribeNewsletter(e.target.checked)}
                      className="mt-0.5 rounded border-border text-neon-green focus:ring-neon-green"
                    />
                    <span className="text-xs text-muted-foreground">
                      Recevoir les meilleures alertes pronostics et opportunités Value Bet par email.
                    </span>
                  </label>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    'w-full mt-4 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-bold text-background transition-all disabled:opacity-50 cursor-pointer shadow-lg',
                    accountType === 'club_pro'
                      ? 'bg-electric-blue hover:bg-electric-blue/90 text-white shadow-electric-blue/25'
                      : 'bg-neon-green hover:bg-neon-green/90 text-background shadow-neon-green/25'
                  )}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
                  ) : accountType === 'club_pro' ? (
                    <>
                      <Crown className="h-5 w-5" /> Créer Mon Compte Club Pro <ArrowRight className="h-5 w-5" />
                    </>
                  ) : (
                    <>
                      Créer Mon Compte Gratuit <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center text-xs text-muted-foreground border-t border-border/40 pt-4">
                Déjà inscrit sur KronosNP IA ?{' '}
                <Link to="/login" className="font-semibold text-neon-green hover:underline cursor-pointer">
                  Connectez-vous ici
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border/30 py-6 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} KronosNP IA. Plateforme sécurisée 18+.</p>
      </footer>
    </div>
  );
}

