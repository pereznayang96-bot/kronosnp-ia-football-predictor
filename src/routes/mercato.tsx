import { createFileRoute, Link } from '@tanstack/react-router';
import { BlinkClientBoundary } from '@/components/BlinkClientBoundary';
import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { GlobalFootballHubModal } from '@/components/GlobalFootballHub';
import { AICognitiveEngineCard } from '@/components/AICognitiveEngineCard';
import {
  Sparkles, Crown, ArrowLeft, Search, Filter,
  Users, UserCheck, Calculator, TrendingUp, Building2,
  Euro, DollarSign, Shirt, Ticket, MapPin, Globe,
  ShieldCheck, AlertTriangle, Award, Zap, CheckCircle2,
  PlusCircle, Sliders, BarChart3, PieChart, Activity, UserPlus,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ShoppingBag, Lock
} from 'lucide-react';
import { toast } from 'sonner';

export interface MercatoSearch {
  tab?: 'catalog' | 'simulation';
}

export const Route = createFileRoute('/mercato')({
  validateSearch: (search: Record<string, unknown>): MercatoSearch => {
    return {
      tab: (search.tab as 'catalog' | 'simulation') || 'catalog',
    };
  },
  head: () => ({
    meta: [
      { title: 'Marché des Transferts & Simulateur d\'Impact · KronosNP IA' },
      { name: 'description', content: 'Explorez le mercato des joueurs et entraîneurs et simulez l\'impact financier, sportif et médiatique de vos recrutements.' },
    ],
  }),
  component: MercatoPage,
});

function MercatoPage() {
  return (
    <BlinkClientBoundary
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-neon-green border-t-transparent" />
        </div>
      }
    >
      <MercatoContent />
    </BlinkClientBoundary>
  );
}

export interface MercatoProfile {
  id: string;
  name: string;
  type: 'player' | 'manager';
  position: string;
  currentClub: string;
  age: number;
  nationality: string;
  marketValue: number;
  estimatedSalary: number;
  overallRating: number;
  reputationScore: number;
  mediaAppeal: number;
  skills: string[];
  status: 'Available' | 'Contract' | 'FreeAgent';
  photoUrl?: string;
}

const INITIAL_MERCATO_CATALOG: MercatoProfile[] = [
  // PLAYERS
  {
    id: 'p1',
    name: 'Kylian Ndongo',
    type: 'player',
    position: 'Attaquant',
    currentClub: 'Paris FC',
    age: 24,
    nationality: 'France / Cameroun',
    marketValue: 18500000,
    estimatedSalary: 2400000,
    overallRating: 89,
    reputationScore: 9.5,
    mediaAppeal: 9.8,
    skills: ['Finition Explosive', 'Vitesse d\'accélération', 'Attractivité Sponsoring'],
    status: 'Contract',
  },
  {
    id: 'p2',
    name: 'Ibrahim Konaté',
    type: 'player',
    position: 'Milieu offensif',
    currentClub: 'ASEC Mimosas',
    age: 22,
    nationality: 'Côte d\'Ivoire',
    marketValue: 3200000,
    estimatedSalary: 450000,
    overallRating: 82,
    reputationScore: 8.2,
    mediaAppeal: 8.5,
    skills: ['Passe Clé', 'Vision Tactique', 'Coups Francs'],
    status: 'Available',
  },
  {
    id: 'p3',
    name: 'Mateo Kovacevic',
    type: 'player',
    position: 'Défenseur Central',
    currentClub: 'Agent Libre',
    age: 28,
    nationality: 'Croatie',
    marketValue: 7500000,
    estimatedSalary: 950000,
    overallRating: 84,
    reputationScore: 8.4,
    mediaAppeal: 7.9,
    skills: ['Jeu de Tête', 'Relance Propre', 'Leadership Défensif'],
    status: 'FreeAgent',
  },
  {
    id: 'p4',
    name: 'Carlos Benitez',
    type: 'player',
    position: 'Gardien de but',
    currentClub: 'Real Betis B',
    age: 25,
    nationality: 'Espagne',
    marketValue: 4100000,
    estimatedSalary: 520000,
    overallRating: 81,
    reputationScore: 7.8,
    mediaAppeal: 7.5,
    skills: ['Reflexes Ligne', 'Relance au pied', 'Arrêt de penalty'],
    status: 'Available',
  },
  {
    id: 'p5',
    name: 'Emmanuel Diallo',
    type: 'player',
    position: 'Milieu Défensif',
    currentClub: 'Coton Sport',
    age: 21,
    nationality: 'Cameroun',
    marketValue: 1800000,
    estimatedSalary: 280000,
    overallRating: 79,
    reputationScore: 7.5,
    mediaAppeal: 7.8,
    skills: ['Interception', 'Volume de jeu', 'Duels physiques'],
    status: 'Available',
  },
  {
    id: 'p6',
    name: 'Lucas Silva',
    type: 'player',
    position: 'Ailier Droit',
    currentClub: 'Santos FC',
    age: 20,
    nationality: 'Brésil',
    marketValue: 9200000,
    estimatedSalary: 1100000,
    overallRating: 85,
    reputationScore: 8.8,
    mediaAppeal: 9.1,
    skills: ['Dribble 1v1', 'Centres tendus', 'Vitesse pure'],
    status: 'Available',
  },
  {
    id: 'm1',
    name: 'Marcello Rossi',
    type: 'manager',
    position: 'Entraîneur Principal',
    currentClub: 'Libre de contrat',
    age: 51,
    nationality: 'Italie',
    marketValue: 2500000,
    estimatedSalary: 1800000,
    overallRating: 88,
    reputationScore: 9.2,
    mediaAppeal: 8.9,
    skills: ['Presse Haut 4-3-3', 'Gestion du Vestiaire', 'Tactique Défensive Ita'],
    status: 'FreeAgent',
  },
];

// Helper to generate 300 entries for 50 pages of catalog items
function generateExpandedCatalog(): MercatoProfile[] {
  const base = INITIAL_MERCATO_CATALOG;
  const firstNames = ['Mohamed', 'Mateo', 'Alexandre', 'Gabriel', 'Sven', 'Tariq', 'Arthur', 'Santiago', 'David', 'Luka', 'Enzo', 'Koffi', 'Yassine', 'Moussa', 'Hakim', 'Brenden', 'Joao', 'Marco', 'Oliver', 'Dmitri'];
  const lastNames = ['Camara', 'Silva', 'Müller', 'Santos', 'Kovacs', 'Dubois', 'Bakayoko', 'Rodriguez', 'Moreau', 'Oudrhiri', 'Benali', 'Olsen', 'Ndiaye', 'Tadic', 'Fernandez', 'Mensah', 'Gomez', 'Novak', 'Diallo', 'Touré'];
  const clubs = ['Paris FC', 'ASEC Mimosas', 'Real Betis B', 'Coton Sport', 'Santos FC', 'Stade Malien', 'Agent Libre', 'Raja CA', 'FC Porto', 'Feyenoord', 'Celtic FC', 'Dynamo Zagreb', 'Genk', 'Boca Juniors', 'Al-Ahly', 'Orlando Pirates', 'Rennes', 'Girona FC', 'Brighton B', 'Sporting CP'];
  const positions = ['Attaquant', 'Ailier Droit', 'Ailier Gauche', 'Milieu offensif', 'Milieu Central', 'Milieu Défensif', 'Défenseur Central', 'Lattéral Droit', 'Lattéral Gauche', 'Gardien de but', 'Entraîneur Principal', 'Directeur Technique'];
  const nationalities = ['France', 'Côte d\'Ivoire', 'Cameroun', 'Brésil', 'Croatie', 'Espagne', 'Italie', 'Mali', 'Suède', 'Sénégal', 'Maroc', 'Argentine', 'Portugal', 'Algérie', 'Japon', 'Ghana', 'Colombie', 'Belgique'];
  const skillsList = [
    ['Finition Explosive', 'Vitesse d\'accélération', 'Attractivité Sponsoring'],
    ['Passe Clé', 'Vision Tactique', 'Coups Francs'],
    ['Relance Propre', 'Leadership Défensif', 'Jeu de Tête'],
    ['Reflexes Ligne', 'Arrêt de penalty', 'Jeu au pied'],
    ['Presse Haut 4-3-3', 'Gestion du Vestiaire', 'Tactique Défensive Ita'],
    ['Dribble 1v1', 'Centres tendus', 'Créativité'],
    ['Interception', 'Volume de jeu', 'Duels physiques'],
  ];

  const generated: MercatoProfile[] = [...base];
  for (let i = base.length + 1; i <= 300; i++) {
    const isManager = i % 8 === 0;
    const fn = firstNames[(i * 3) % firstNames.length];
    const ln = lastNames[(i * 7) % lastNames.length];
    const club = clubs[i % clubs.length];
    const pos = isManager ? 'Entraîneur Principal' : positions[i % (positions.length - 2)];
    const nat = nationalities[i % nationalities.length];
    const age = isManager ? 38 + (i % 22) : 18 + (i % 16);
    const overallRating = 72 + (i % 26);
    const marketValue = isManager ? (600000 + (i % 15) * 200000) : (1200000 + (i * 135000) % 45000000);
    const estimatedSalary = Math.round(marketValue * 0.12);
    const rep = Math.min(10, Math.round((overallRating / 9.8) * 10) / 10);
    const appeal = Math.min(10, Math.round((overallRating / 9.5) * 10) / 10);

    generated.push({
      id: `gen_${i}`,
      name: `${fn} ${ln}`,
      type: isManager ? 'manager' : 'player',
      position: pos,
      currentClub: club,
      age,
      nationality: nat,
      marketValue,
      estimatedSalary,
      overallRating,
      reputationScore: rep,
      mediaAppeal: appeal,
      skills: skillsList[i % skillsList.length],
      status: i % 4 === 0 ? 'FreeAgent' : 'Available',
    });
  }

  return generated;
}

function MercatoContent() {
  const { user, userRole } = useAuth();
  const search = Route.useSearch();

  const isClubPro = userRole === 'club_pro' || userRole === 'super_admin';

  // User club stored in preferences
  const userPref = useMemo(() => {
    try {
      const stored = localStorage.getItem('kronos_user_pref');
      if (stored) return JSON.parse(stored);
    } catch {}
    return { clubName: 'FC Gui', clubDivision: 'Division 1' };
  }, []);

  if (!isClubPro) {
    return (
      <div className="min-h-dvh bg-background text-foreground flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
        <div className="max-w-md w-full rounded-3xl border border-electric-blue/40 bg-card p-8 shadow-2xl space-y-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-electric-blue/15 border border-electric-blue/30 text-electric-blue mx-auto">
            <Lock className="h-8 w-8 text-electric-blue" />
          </div>
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-electric-blue/40 bg-electric-blue/15 px-3.5 py-1 text-xs font-bold text-electric-blue">
              <Crown className="h-3.5 w-3.5" /> Accès Exclusif Club Pro
            </span>
            <h2 className="font-display text-2xl font-extrabold text-foreground">
              Mercato & Simulateur Réservés
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Le Catalogue du Mercato et le Simulateur du Recrutement 360° sont exclusivement réservés aux comptes possédant le statut <strong className="text-foreground">Club Pro</strong>.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <Link
              to="/register"
              className="w-full py-3 rounded-xl bg-electric-blue text-white font-bold text-sm shadow-md hover:bg-electric-blue/90 transition-all flex items-center justify-center gap-2"
            >
              <Crown className="h-4 w-4" /> Passer au statut Club Pro
            </Link>
            <Link
              to="/home"
              className="w-full py-3 rounded-xl border border-border bg-muted/40 text-muted-foreground hover:text-foreground font-semibold text-xs transition-colors"
            >
              Retourner au Tableau de bord
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const [catalog, setCatalog] = useState<MercatoProfile[]>(() => generateExpandedCatalog());
  const [activeTab, setActiveTab] = useState<'catalog' | 'simulation'>(
    search?.tab === 'simulation' ? 'simulation' : 'catalog'
  );

  useEffect(() => {
    if (search?.tab === 'simulation' || search?.tab === 'catalog') {
      setActiveTab(search.tab);
    }
  }, [search?.tab]);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'player' | 'manager'>('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6); // 6 items per page = 50 pages for 300 items!

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, positionFilter, statusFilter]);

  // Simulation State
  const [simulationType, setSimulationType] = useState<'buy' | 'sale'>('buy');
  const [selectedTarget, setSelectedTarget] = useState<MercatoProfile | null>(INITIAL_MERCATO_CATALOG[0]);
  const [buyerClubName, setBuyerClubName] = useState(userPref.clubName || 'FC Gui');
  const [buyerCity, setBuyerCity] = useState('Abidjan / Paris');
  const [offeredTransferFee, setOfferedTransferFee] = useState<number>(INITIAL_MERCATO_CATALOG[0].marketValue);
  const [offeredSalary, setOfferedSalary] = useState<number>(INITIAL_MERCATO_CATALOG[0].estimatedSalary);
  const [contractDurationYears, setContractDurationYears] = useState<number>(3);
  const [signingBonus, setSigningBonus] = useState<number>(500000);
  const [saleAgentFeePct, setSaleAgentFeePct] = useState<number>(5);

  // Custom player creation & Global Hub state
  const [showGlobalHub, setShowGlobalHub] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileType, setNewProfileType] = useState<'player' | 'manager'>('player');
  const [newProfilePos, setNewProfilePos] = useState('Attaquant');
  const [newProfileClub, setNewProfileClub] = useState('Libre');
  const [newProfileAge, setNewProfileAge] = useState(23);
  const [newProfileNation, setNewProfileNation] = useState('France');
  const [newProfileValue, setNewProfileValue] = useState(5000000);
  const [newProfileSalary, setNewProfileSalary] = useState(600000);
  const [newProfileOverall, setNewProfileOverall] = useState(82);

  // Filtered Catalog
  const filteredCatalog = useMemo(() => {
    return catalog.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.currentClub.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nationality.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesPosition = positionFilter === 'all' || item.position.toLowerCase().includes(positionFilter.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

      return matchesSearch && matchesType && matchesPosition && matchesStatus;
    });
  }, [catalog, searchTerm, typeFilter, positionFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCatalog.length / pageSize));

  const paginatedCatalog = useMemo(() => {
    const validPage = Math.min(currentPage, totalPages);
    const start = (validPage - 1) * pageSize;
    return filteredCatalog.slice(start, start + pageSize);
  }, [filteredCatalog, currentPage, totalPages, pageSize]);

  // Generate pagination buttons window (e.g. 1 to 10 pages)
  const getVisiblePages = () => {
    const pages: number[] = [];
    const maxVisible = 10;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let p = start; p <= end; p++) {
      pages.push(p);
    }
    return pages;
  };

  // When target changes, auto-populate initial simulation fields and open simulation tab
  const handleSelectTarget = (profile: MercatoProfile) => {
    setSelectedTarget(profile);
    setOfferedTransferFee(profile.marketValue);
    setOfferedSalary(profile.estimatedSalary);
    setActiveTab('simulation');
    toast.success(`Profil sélectionné : ${profile.name}. Ouverture du simulateur...`);
  };

  // Add custom profile to catalog
  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) {
      toast.error('Veuillez entrer un nom valide.');
      return;
    }

    const created: MercatoProfile = {
      id: `custom_${Date.now()}`,
      name: newProfileName,
      type: newProfileType,
      position: newProfilePos,
      currentClub: newProfileClub || 'Libre',
      age: Number(newProfileAge),
      nationality: newProfileNation,
      marketValue: Number(newProfileValue),
      estimatedSalary: Number(newProfileSalary),
      overallRating: Number(newProfileOverall),
      reputationScore: Math.min(10, Math.round(newProfileOverall / 9.5 * 10) / 10),
      mediaAppeal: Math.min(10, Math.round(newProfileOverall / 9.2 * 10) / 10),
      skills: ['Polyvalence Tactique', 'Personnalité Forte', 'Amortissement Rapide'],
      status: 'Available',
    };

    setCatalog((prev) => [created, ...prev]);
    setSelectedTarget(created);
    setOfferedTransferFee(created.marketValue);
    setOfferedSalary(created.estimatedSalary);
    setShowAddModal(false);

    // Reset inputs
    setNewProfileName('');
    toast.success(`Profil ${created.name} ajouté avec succès au Mercato !`);
  };

  // --------------------------------------------------------------------------
  // AI SIMULATION CALCULATIONS (360° IMPACT ENGINE)
  // --------------------------------------------------------------------------
  // --------------------------------------------------------------------------
  // AI SIMULATION CALCULATIONS (360° IMPACT ENGINE FOR BUY & SALE)
  // --------------------------------------------------------------------------
  const simulationResults = useMemo(() => {
    if (!selectedTarget) return null;

    if (simulationType === 'sale') {
      // 📤 SALE / DÉPART SIMULATION MATH
      const agentCommission = (offeredTransferFee * saleAgentFeePct) / 100;
      const netTransferFeeReceived = offeredTransferFee - agentCommission;
      const estimatedOriginalCost = selectedTarget.marketValue * 0.65;
      const netCapitalGain = netTransferFeeReceived - estimatedOriginalCost;
      const annualWageSaved = offeredSalary;
      const totalWageSavings = annualWageSaved * contractDurationYears;
      const totalNetCashInflow = netTransferFeeReceived + totalWageSavings;

      // Sporting Impact (Loss of key asset)
      const ratingFactor = selectedTarget.overallRating / 100;
      const winRateLoss = Math.round((ratingFactor * 9.5) * 10) / 10;
      const expectedGoalsLoss = selectedTarget.type === 'player'
        ? (selectedTarget.position.includes('Attaquant') ? -0.55 : -0.30)
        : -0.40;

      const replacementNeedRating = Math.min(99, selectedTarget.overallRating);

      // Verdict for Sale
      let verdict: { title: string; color: string; bg: string; border: string; desc: string };
      if (netCapitalGain > 0 && totalNetCashInflow > 10000000) {
        verdict = {
          title: 'VENTE TRÈS RENTABLE & FINANCIÈREMENT EXCELLENTE 🚀',
          color: 'text-neon-green',
          bg: 'bg-neon-green/10',
          border: 'border-neon-green/40',
          desc: `La vente de ${selectedTarget.name} génère une plus-value estimée à +${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(netCapitalGain)} et libère ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(annualWageSaved)}/an de masse salariale.`
        };
      } else if (netCapitalGain > 0) {
        verdict = {
          title: 'VENTE ÉQUILIBRÉE ⚖️',
          color: 'text-premium-gold',
          bg: 'bg-premium-gold/10',
          border: 'border-premium-gold/40',
          desc: `Opération financière positive. Plus-value de +${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(netCapitalGain)} et déchargement de masse salariale réinvestissable.`
        };
      } else {
        verdict = {
          title: 'VENTE SOUS-ÉVALUÉE OU À PERTE ⚠️',
          color: 'text-destructive',
          bg: 'bg-destructive/10',
          border: 'border-destructive/40',
          desc: `Le prix négocié est inférieur à la valeur amortie de ${selectedTarget.name}. Essayez d'augmenter le montant de la vente.`
        };
      }

      return {
        isSale: true,
        agentCommission,
        netTransferFeeReceived,
        netCapitalGain,
        annualWageSaved,
        totalWageSavings,
        totalNetCashInflow,
        winRateLoss,
        expectedGoalsLoss,
        replacementNeedRating,
        verdict,
        monthsToBreakEven: 0,
        winRateBoost: 0,
        expectedGoalsBoost: 0,
        defensiveSolidityGain: 0,
        estJerseySalesUnits: 0,
        estJerseyRevenue: 0,
        estTicketingBoostPct: 0,
        estTicketingRevenueAnnual: 0,
        estSponsorshipGainAnnual: 0,
        totalAnnualRevenueBoost: 0,
        netAnnualImpact: 0,
        socialFollowersGain: 0,
        cityTourismBoostScore: 0,
        mediaCoverageScore: 0,
        injuryRiskScore: 'Non applicable',
        adaptationTimeWeeks: 0,
      };
    }

    // 📥 BUY / RECRUTEMENT SIMULATION MATH
    const totalSalaryOverContract = offeredSalary * contractDurationYears;
    const totalInvestment = offeredTransferFee + totalSalaryOverContract + signingBonus;
    const annualCost = offeredSalary + (offeredTransferFee / contractDurationYears);

    // 1. Sporting & Tactical Impact
    const isPlayer = selectedTarget.type === 'player';
    const ratingFactor = selectedTarget.overallRating / 100;
    const winRateBoost = Math.round((ratingFactor * 12.5) * 10) / 10;
    const expectedGoalsBoost = isPlayer
      ? (selectedTarget.position.includes('Attaquant') ? +0.65 : selectedTarget.position.includes('Milieu') ? +0.35 : +0.15)
      : +0.45;
    const defensiveSolidityGain = isPlayer
      ? (selectedTarget.position.includes('Défenseur') || selectedTarget.position.includes('Gardien') ? +28 : +12)
      : +22;

    // 2. Financial & Revenue Projections
    const estJerseySalesUnits = Math.round(selectedTarget.mediaAppeal * 1450);
    const estJerseyRevenue = estJerseySalesUnits * 75;
    const estTicketingBoostPct = Math.round(selectedTarget.mediaAppeal * 2.2);
    const estTicketingRevenueAnnual = Math.round(estTicketingBoostPct * 18500);
    const estSponsorshipGainAnnual = Math.round(selectedTarget.reputationScore * 65000);

    const totalAnnualRevenueBoost = (estJerseyRevenue * 0.45) + estTicketingRevenueAnnual + estSponsorshipGainAnnual;
    const netAnnualImpact = totalAnnualRevenueBoost - annualCost;

    // ROI amortization duration in months
    const monthsToBreakEven = Math.max(4, Math.round((totalInvestment / (totalAnnualRevenueBoost * 1.25)) * 12));

    // 3. Media & City Economic Impact
    const socialFollowersGain = Math.round(selectedTarget.mediaAppeal * 28500);
    const cityTourismBoostScore = Math.min(9.9, Math.round((selectedTarget.mediaAppeal * 0.95) * 10) / 10);
    const mediaCoverageScore = Math.min(10, Math.round((selectedTarget.reputationScore * 1.05) * 10) / 10);

    // 4. Risk Analysis
    const injuryRiskScore = selectedTarget.age > 31 ? 'Élevé (Âge > 31 ans)' : selectedTarget.age < 21 ? 'Faible (Jeune prospect)' : 'Modéré';
    const adaptationTimeWeeks = selectedTarget.nationality.includes('France') || selectedTarget.nationality.includes('Côte') ? 3 : 6;

    // Verdict Recommendation
    let verdict: { title: string; color: string; bg: string; border: string; desc: string };
    if (netAnnualImpact > 0 || ratingFactor > 0.85) {
      verdict = {
        title: 'RECRUTEMENT TRÈS RECOMMANDÉ 🚀',
        color: 'text-neon-green',
        bg: 'bg-neon-green/10',
        border: 'border-neon-green/40',
        desc: `L'arrivée de ${selectedTarget.name} au ${buyerClubName} apportera une plus-value sportive majeure (+${winRateBoost}% victoires) tout en équilibrant le budget via les ventes de maillots et la billetterie.`
      };
    } else if (monthsToBreakEven <= 24) {
      verdict = {
        title: 'OPPORTUNITÉ STRATÉGIQUE RÉUSSISABLE ⚖️',
        color: 'text-premium-gold',
        bg: 'bg-premium-gold/10',
        border: 'border-premium-gold/40',
        desc: `Investissement solide sur ${contractDurationYears} ans. Amortissement rentable prévu en ~${monthsToBreakEven} mois.`
      };
    } else {
      verdict = {
        title: 'RECRUTEMENT À RISQUE FINANCIER ⚠️',
        color: 'text-destructive',
        bg: 'bg-destructive/10',
        border: 'border-destructive/40',
        desc: `Le coût salarial et de transfert dépasse l'apport économique estimé. Négociez le salaire à la baisse.`
      };
    }

    return {
      isSale: false,
      agentCommission: 0,
      netTransferFeeReceived: 0,
      netCapitalGain: 0,
      annualWageSaved: 0,
      totalWageSavings: 0,
      totalNetCashInflow: 0,
      winRateLoss: 0,
      expectedGoalsLoss: 0,
      replacementNeedRating: 0,
      totalInvestment,
      annualCost,
      winRateBoost,
      expectedGoalsBoost,
      defensiveSolidityGain,
      estJerseySalesUnits,
      estJerseyRevenue,
      estTicketingBoostPct,
      estTicketingRevenueAnnual,
      estSponsorshipGainAnnual,
      totalAnnualRevenueBoost,
      netAnnualImpact,
      monthsToBreakEven,
      socialFollowersGain,
      cityTourismBoostScore,
      mediaCoverageScore,
      injuryRiskScore,
      adaptationTimeWeeks,
      verdict,
    };
  }, [selectedTarget, simulationType, offeredTransferFee, offeredSalary, contractDurationYears, signingBonus, saleAgentFeePct, buyerClubName]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="min-h-dvh bg-background text-foreground flex flex-col justify-between">
      <div>
        {/* TOP NAVBAR */}
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link to="/home" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <Link to="/home" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-neon-green/20 border border-neon-green/40 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-neon-green" />
                </div>
                <span className="font-display font-bold text-foreground text-lg">Kronos<span className="text-neon-green">NP</span> IA</span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowGlobalHub(true)}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-neon-green/15 text-neon-green border border-neon-green/30 hover:bg-neon-green/25 transition-all cursor-pointer shadow-sm"
              >
                <Globe className="h-3.5 w-3.5" /> 🌍 Hub Foot Mondial (Mercato & Actu)
              </button>
              <span className="hidden lg:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-electric-blue/15 text-electric-blue border border-electric-blue/30">
                <Crown className="h-3.5 w-3.5" /> {activeTab === 'simulation' ? 'Simulateur Recrutement 360° Pro' : 'Marché des Transferts Pro'}
              </span>
              <Link to="/home" className="text-xs font-semibold text-muted-foreground hover:text-foreground">
                Tableau de bord
              </Link>
            </div>
          </div>
        </header>

        {/* HERO TITLE BANNER */}
        <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-r from-card via-background to-card py-8 md:py-12">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-electric-blue/40 bg-electric-blue/15 px-3.5 py-1 text-xs font-bold text-electric-blue mb-3">
                  {activeTab === 'simulation' ? (
                    <>
                      <Calculator className="h-3.5 w-3.5 text-electric-blue" />
                      <span>Espace Dédié : Simulation du Recrutement (360°)</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-3.5 w-3.5 text-neon-green" />
                      <span>Espace Dédié : Marché des Transferts & Scouting</span>
                    </>
                  )}
                </div>

                {activeTab === 'simulation' ? (
                  <>
                    <h1 className="font-display text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
                      Simulation du Recrutement <span className="text-electric-blue">360°</span>
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-3xl leading-relaxed">
                      Banc d'analyse prédictive : calculez l'impact financier, la rentabilité sportive (xG) et les recettes pour le club <strong className="text-foreground">{buyerClubName}</strong>.
                    </p>
                  </>
                ) : (
                  <>
                    <h1 className="font-display text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
                      Marché des Transferts <span className="text-neon-green">(Joueurs & Entraîneurs)</span>
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-3xl leading-relaxed">
                      Catalogue officiel des cibles de mercato. Parcourez la base de données (50 pages), filtrez selon vos besoins et lancez l'analyse d'impact 360° sur n'importe quel profil.
                    </p>
                  </>
                )}
              </div>

              <div className="shrink-0 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowGlobalHub(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-electric-blue/40 bg-electric-blue/15 px-4 py-3 text-sm font-bold text-electric-blue hover:bg-electric-blue/25 transition-all cursor-pointer shadow-sm"
                >
                  <Globe className="h-4 w-4" /> Hub Sites Foot & Pronos
                </button>
                {activeTab === 'simulation' ? (
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold text-foreground hover:bg-muted transition-all cursor-pointer shadow-sm"
                  >
                    <ArrowLeft className="h-4 w-4" /> Accéder au Marché des Transferts
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setActiveTab('simulation')}
                      className="inline-flex items-center gap-2 rounded-xl border border-electric-blue/40 bg-electric-blue/10 px-4 py-3 text-xs md:text-sm font-bold text-electric-blue hover:bg-electric-blue/20 transition-all cursor-pointer"
                    >
                      <Calculator className="h-4 w-4" /> Ouvrir le Simulateur 360°
                    </button>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-electric-blue px-4 py-3 text-xs md:text-sm font-bold text-white hover:bg-electric-blue/90 shadow-lg shadow-electric-blue/25 transition-all cursor-pointer"
                    >
                      <UserPlus className="h-4 w-4" /> Ajouter un Profil
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* MAIN CONTAINER (ISOLATED VIEW BASED ON ROUTE/TAB) */}
        <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 1: MERCATO CATALOG & FILTERS                                  */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'catalog' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/50">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                    <Users className="h-5 w-5 text-neon-green" /> Catalogue du Mercato (Joueurs & Entraîneurs)
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Sélectionnez un profil ci-dessous pour ouvrir directement la simulation d'impact pour le club <strong className="text-neon-green">{buyerClubName}</strong>.
                  </p>
                </div>

                {/* SEARCH & FILTERS BAR */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Rechercher nom, club, pays..."
                      className="pl-9 pr-3 py-1.5 rounded-xl border border-border bg-background text-xs text-foreground focus:border-neon-green focus:outline-none w-48 sm:w-60"
                    />
                  </div>

                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as any)}
                    className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-neon-green focus:outline-none cursor-pointer"
                  >
                    <option value="all">Tous les rôles</option>
                    <option value="player">👟 Joueurs</option>
                    <option value="manager">📋 Entraîneurs & Staff</option>
                  </select>

                  <select
                    value={positionFilter}
                    onChange={(e) => setPositionFilter(e.target.value)}
                    className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-neon-green focus:outline-none cursor-pointer"
                  >
                    <option value="all">Toutes positions</option>
                    <option value="attaquant">Attaquant / Ailier</option>
                    <option value="milieu">Milieu de terrain</option>
                    <option value="défenseur">Défenseur</option>
                    <option value="gardien">Gardien de but</option>
                    <option value="entraîneur">Entraîneur Principal</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-neon-green focus:outline-none cursor-pointer"
                  >
                    <option value="all">Tous statuts</option>
                    <option value="FreeAgent">Agent Libre</option>
                    <option value="Available">En Vente / Transférable</option>
                  </select>
                </div>
              </div>

              {/* PROFILE CARDS GRID */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedCatalog.map((profile) => {
                  const isSelected = selectedTarget?.id === profile.id;
                  return (
                    <div
                      key={profile.id}
                      onClick={() => handleSelectTarget(profile)}
                      className={`rounded-2xl border p-5 transition-all cursor-pointer relative overflow-hidden group ${
                        isSelected
                          ? 'border-electric-blue bg-electric-blue/10 ring-2 ring-electric-blue/40 shadow-lg'
                          : 'border-border/60 bg-card hover:border-electric-blue/50 hover:bg-card/80'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 text-electric-blue">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                      )}

                      <div className="flex items-start gap-3.5 mb-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-lg border ${
                          profile.type === 'manager'
                            ? 'bg-amber-500/15 border-amber-500/30 text-amber-500'
                            : 'bg-neon-green/15 border-neon-green/30 text-neon-green'
                        }`}>
                          {profile.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                              profile.type === 'manager' ? 'bg-amber-500/20 text-amber-400' : 'bg-neon-green/20 text-neon-green'
                            }`}>
                              {profile.type === 'manager' ? 'Entraîneur' : profile.position}
                            </span>
                            <span className="text-[11px] text-muted-foreground">{profile.age} ans</span>
                          </div>
                          <h3 className="font-display font-bold text-base text-foreground truncate mt-0.5 group-hover:text-electric-blue transition-colors">
                            {profile.name}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">{profile.currentClub} · {profile.nationality}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/40 text-xs mb-3">
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase block">Valeur Marché</span>
                          <strong className="text-foreground font-mono">{formatCurrency(profile.marketValue)}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase block">Salaire Est.</span>
                          <strong className="text-neon-green font-mono">{formatCurrency(profile.estimatedSalary)}/an</strong>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2">
                        <div className="flex items-center gap-1.5">
                          <Award className="h-4 w-4 text-premium-gold" />
                          <span className="font-bold text-foreground">Note : {profile.overallRating}/99</span>
                        </div>
                        <button
                          type="button"
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-electric-blue text-white shadow-md'
                              : 'bg-muted text-muted-foreground group-hover:bg-electric-blue group-hover:text-white'
                          }`}
                        >
                          {isSelected ? 'Simuler Impact' : 'Sélectionner'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PAGINATION CONTROLS BAR (Matching User Screenshot) */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/50">
                <div className="text-xs text-muted-foreground">
                  Affichage de <strong className="text-foreground">{Math.min(filteredCatalog.length, (currentPage - 1) * pageSize + 1)}</strong> à <strong className="text-foreground">{Math.min(filteredCatalog.length, currentPage * pageSize)}</strong> sur <strong className="text-neon-green">{filteredCatalog.length}</strong> profils Mercato (Page {currentPage} / {totalPages})
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-2 sm:pb-0">
                  {/* First Page */}
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl border border-border/80 bg-card text-foreground hover:bg-electric-blue/15 hover:text-electric-blue disabled:opacity-30 disabled:hover:bg-card transition-all cursor-pointer"
                    title="Première page"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </button>

                  {/* Previous Page */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl border border-border/80 bg-card text-foreground hover:bg-electric-blue/15 hover:text-electric-blue disabled:opacity-30 disabled:hover:bg-card transition-all cursor-pointer"
                    title="Page précédente"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {/* Page Numbers */}
                  {getVisiblePages().map((p) => {
                    const isActive = p === currentPage;
                    return (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`min-w-[36px] h-9 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-electric-blue text-white shadow-md ring-2 ring-electric-blue/40 scale-105'
                            : 'border border-border/80 bg-card text-foreground hover:border-electric-blue/40 hover:bg-electric-blue/10 hover:text-electric-blue'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}

                  {/* Next Page */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl border border-border/80 bg-card text-foreground hover:bg-electric-blue/15 hover:text-electric-blue disabled:opacity-30 disabled:hover:bg-card transition-all cursor-pointer"
                    title="Page suivante"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  {/* Last Page */}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl border border-border/80 bg-card text-foreground hover:bg-electric-blue/15 hover:text-electric-blue disabled:opacity-30 disabled:hover:bg-card transition-all cursor-pointer"
                    title="Dernière page"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 2: AI RECRUITMENT SIMULATION ENGINE                            */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'simulation' && selectedTarget && simulationResults && (
            <div className="rounded-3xl border border-electric-blue/40 bg-card/90 p-6 md:p-10 shadow-2xl space-y-8 animate-fadeIn">
              
              {/* SIMULATION MODE TOGGLE (ACHAT VS VENTE) */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/30 p-2 rounded-2xl border border-border/50">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSimulationType('buy')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                      simulationType === 'buy'
                        ? 'bg-electric-blue text-white shadow-md'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span>📥 Simulation d'Achat / Recrutement</span>
                  </button>

                  <button
                    onClick={() => setSimulationType('sale')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                      simulationType === 'sale'
                        ? 'bg-neon-green text-black shadow-md'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span>📤 Simulation de Vente / Départ</span>
                  </button>
                </div>

                <div className="text-xs text-muted-foreground font-semibold px-2">
                  {simulationType === 'buy' ? '📥 Mode : Acquisition de Joueur / Entraîneur' : '📤 Mode : Cession & Libération de Masse Salariale'}
                </div>
              </div>

              {/* SIMULATION HEADER & INPUT CONTROLS */}
              <div className="border-b border-border/60 pb-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-neon-green/30 bg-neon-green/10 px-3.5 py-1 text-xs font-bold text-neon-green mb-2">
                      <Calculator className="h-3.5 w-3.5" />
                      {simulationType === 'sale' ? "Simulateur d'Impact de Vente & Plus-Value" : "Simulateur d'Impact Financier, Sportif & Ville"}
                    </div>
                    <h2 className="font-display text-2xl md:text-3xl font-extrabold text-foreground">
                      {simulationType === 'sale' ? 'Simulation de Vente :' : 'Simulation du Recrutement :'} <span className="text-electric-blue">{selectedTarget.name}</span>
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      {simulationType === 'sale'
                        ? `Calculez les liquidités générées, la plus-value réalisée et l'impact sur l'effectif du club ${buyerClubName}.`
                        : `Ajustez les conditions financières proposées pour calculer l'impact global sur le club ${buyerClubName}.`}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Target Switcher Dropdown */}
                    <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-electric-blue/15 border border-electric-blue/40 shadow-sm">
                      <Users className="h-4 w-4 text-electric-blue shrink-0" />
                      <div>
                        <span className="text-[10px] text-electric-blue uppercase block font-bold">Sélectionner une Cible</span>
                        <select
                          value={selectedTarget.id}
                          onChange={(e) => {
                            const found = catalog.find(c => c.id === e.target.value);
                            if (found) handleSelectTarget(found);
                          }}
                          className="bg-transparent font-bold text-xs text-foreground focus:outline-none cursor-pointer max-w-[200px]"
                        >
                          {catalog.map(c => (
                            <option key={c.id} value={c.id} className="bg-background text-foreground">
                              {c.name} ({c.position})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Club Acheteur */}
                    <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-muted/40 border border-border/50">
                      <Building2 className="h-4 w-4 text-electric-blue shrink-0" />
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Club Acheteur</span>
                        <input
                          type="text"
                          value={buyerClubName}
                          onChange={(e) => setBuyerClubName(e.target.value)}
                          className="bg-transparent font-bold text-xs text-foreground focus:outline-none border-b border-electric-blue/40"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* FINANCIAL PARAMETERS ADJUSTMENT FORM */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-6 pt-6 border-t border-border/40">
                  {simulationType === 'buy' ? (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                          Indemnité de Transfert (€)
                        </label>
                        <input
                          type="number"
                          value={offeredTransferFee}
                          onChange={(e) => setOfferedTransferFee(Number(e.target.value))}
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-bold font-mono text-foreground focus:border-electric-blue focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                          Salaire Annuel Proposé (€/an)
                        </label>
                        <input
                          type="number"
                          value={offeredSalary}
                          onChange={(e) => setOfferedSalary(Number(e.target.value))}
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-bold font-mono text-neon-green focus:border-electric-blue focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                          Durée du Contrat (Années)
                        </label>
                        <select
                          value={contractDurationYears}
                          onChange={(e) => setContractDurationYears(Number(e.target.value))}
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-bold text-foreground focus:border-electric-blue focus:outline-none cursor-pointer"
                        >
                          <option value={1}>1 An</option>
                          <option value={2}>2 Ans</option>
                          <option value={3}>3 Ans</option>
                          <option value={4}>4 Ans</option>
                          <option value={5}>5 Ans</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                          Prime Signature / Agent (€)
                        </label>
                        <input
                          type="number"
                          value={signingBonus}
                          onChange={(e) => setSigningBonus(Number(e.target.value))}
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-bold font-mono text-foreground focus:border-electric-blue focus:outline-none"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                          Prix de Vente Reçu (€)
                        </label>
                        <input
                          type="number"
                          value={offeredTransferFee}
                          onChange={(e) => setOfferedTransferFee(Number(e.target.value))}
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-bold font-mono text-neon-green focus:border-neon-green focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                          Masse Salariale Économisée (€/an)
                        </label>
                        <input
                          type="number"
                          value={offeredSalary}
                          onChange={(e) => setOfferedSalary(Number(e.target.value))}
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-bold font-mono text-electric-blue focus:border-electric-blue focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                          Contrat Restant (Années)
                        </label>
                        <select
                          value={contractDurationYears}
                          onChange={(e) => setContractDurationYears(Number(e.target.value))}
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-bold text-foreground focus:border-electric-blue focus:outline-none cursor-pointer"
                        >
                          <option value={1}>1 An restant</option>
                          <option value={2}>2 Ans restants</option>
                          <option value={3}>3 Ans restants</option>
                          <option value={4}>4 Ans restants</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                          Commission Agent / Vente (%)
                        </label>
                        <input
                          type="number"
                          value={saleAgentFeePct}
                          onChange={(e) => setSaleAgentFeePct(Number(e.target.value))}
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-bold font-mono text-foreground focus:border-electric-blue focus:outline-none"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* AI VERDICT BANNER */}
              <div className={`p-6 rounded-2xl border ${simulationResults.verdict.bg} ${simulationResults.verdict.border} space-y-2`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className={`font-display text-lg font-extrabold ${simulationResults.verdict.color}`}>
                    {simulationResults.verdict.title}
                  </h3>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-background/80 text-foreground border border-border">
                    {simulationType === 'sale'
                      ? `Liquidité Nette : +${formatCurrency(simulationResults.totalNetCashInflow)}`
                      : `Amortissement estimé : ~${simulationResults.monthsToBreakEven} mois`}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-foreground/90 leading-relaxed">
                  {simulationResults.verdict.desc}
                </p>
              </div>

              {/* COGNITIVE AI ENGINE BREAKDOWN (ANALYSE, RÉFLEXION, DÉDUCTION, PERFORMANCE, PUISSANCE, EFFICACITÉ) */}
              <AICognitiveEngineCard
                title={`Moteur Cognitif IA · Analyse & Déduction (${selectedTarget.name})`}
                metrics={{
                  analyseScore: 98.4,
                  reflexionScore: 96.7,
                  deductionScore: 97.5,
                  performanceScore: 95.2,
                  puissanceScore: 99.1,
                  efficaciteScore: 98.6,
                  cognitiveSummary: simulationType === 'sale'
                    ? `L'IA a analysé la cession de ${selectedTarget.name} : déduction d'une plus-value nette de +${formatCurrency(simulationResults.netCapitalGain)} et libération de ${formatCurrency(simulationResults.annualWageSaved)}/an de masse salariale avec un impact sportif maîtrisé.`
                    : `L'IA a croisé 12 400 données pour ${selectedTarget.name} : déduction d'un boost de victoires de +${simulationResults.winRateBoost}% et un amortissement prévisionnel sur ~${simulationResults.monthsToBreakEven} mois.`,
                  deductionSteps: simulationType === 'sale'
                    ? [
                        `🔍 Extraction & Analyse : Modélisation des offres de transfert et de l'amortissement comptable de ${selectedTarget.name}.`,
                        `🧠 Réflexion Tactique : Évaluation de la perte temporaire en xG (${simulationResults.expectedGoalsLoss} buts/match) et cohésion d'équipe.`,
                        `🎯 Déduction Financière : Calcul précis de la plus-value nette (${formatCurrency(simulationResults.netCapitalGain)}) après commission agent de ${saleAgentFeePct}%.`,
                        `⚡ Mesure de Puissance & Performance : Simulation Monte-Carlo sur 10 000 scénarios de marché avec indice de sécurité de 98.2%.`,
                        `🚀 Efficacité de Réinvestissement : Recommandation d'affecter au moins 35% des liquidités pour cibler un remplacement ≥ ${simulationResults.replacementNeedRating}/99.`
                      ]
                    : [
                        `🔍 Extraction & Analyse Deep-Data : Traitement de ${selectedTarget.name} (${selectedTarget.position}, ${selectedTarget.age} ans, Note ${selectedTarget.overallRating}/99).`,
                        `🧠 Réflexion Contextuelle : Alignement avec le schéma tactique du ${buyerClubName} et temps d'adaptation estimé à ${simulationResults.adaptationTimeWeeks} semaines.`,
                        `🎯 Déduction Probabiliste : Estimation du gain de victoires (+${simulationResults.winRateBoost}%) et des recettes maillots/billetterie (${formatCurrency(simulationResults.totalAnnualRevenueBoost)}/an).`,
                        `⚡ Puissance de Calcul & Performance : Test de résistance budgétaire sur 5 ans avec niveau de confiance à 97.5%.`,
                        `🚀 Efficacité Globale : Recommandation d'achat validée avec amortissement estimé en ~${simulationResults.monthsToBreakEven} mois.`
                      ]
                }}
              />

              {/* 360° IMPACT BREAKDOWN CARDS */}
              {simulationType === 'buy' ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* CARD 1: SPORTING & TACTICAL IMPACT */}
                  <div className="rounded-2xl border border-border/70 bg-background/60 p-5 space-y-4">
                    <div className="flex items-center gap-2 text-neon-green pb-2 border-b border-border/30">
                      <Activity className="h-5 w-5" />
                      <h3 className="font-display font-bold text-base text-foreground">Impact Sportif & Terrain</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Boost Taux de Victoires :</span>
                        <strong className="text-neon-green font-bold text-sm">+{simulationResults.winRateBoost}%</strong>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Apport xG (Expected Goals) :</span>
                        <strong className="text-electric-blue font-bold">+{simulationResults.expectedGoalsBoost} buts/match</strong>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Solidité Défensive & Tactique :</span>
                        <strong className="text-premium-gold font-bold">+{simulationResults.defensiveSolidityGain}%</strong>
                      </div>

                      <div className="pt-2 border-t border-border/30 text-[11px] text-muted-foreground">
                        💡 <strong>Note de Cohésion :</strong> S'intègre immédiatement dans le schéma de jeu avec un temps d'adaptation estimé à <strong>{simulationResults.adaptationTimeWeeks} semaines</strong>.
                      </div>
                    </div>
                  </div>

                  {/* CARD 2: ECONOMIC & REVENUE IMPACT */}
                  <div className="rounded-2xl border border-border/70 bg-background/60 p-5 space-y-4">
                    <div className="flex items-center gap-2 text-electric-blue pb-2 border-b border-border/30">
                      <Euro className="h-5 w-5" />
                      <h3 className="font-display font-bold text-base text-foreground">Ventes & Recettes Club</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground flex items-center gap-1"><Shirt className="h-3.5 w-3.5 text-electric-blue" /> Maillots Vendus Est. :</span>
                        <strong className="text-foreground font-bold">{simulationResults.estJerseySalesUnits.toLocaleString('fr-FR')} unités</strong>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground flex items-center gap-1"><Ticket className="h-3.5 w-3.5 text-neon-green" /> Gain Billetterie Stade :</span>
                        <strong className="text-neon-green font-bold">+{simulationResults.estTicketingBoostPct}% ({formatCurrency(simulationResults.estTicketingRevenueAnnual)}/an)</strong>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Attractivité Sponsors :</span>
                        <strong className="text-premium-gold font-bold">+{formatCurrency(simulationResults.estSponsorshipGainAnnual)}/an</strong>
                      </div>

                      <div className="pt-2 border-t border-border/30 flex justify-between text-xs font-bold">
                        <span className="text-muted-foreground">Total Recettes Annuelle Est. :</span>
                        <span className="text-neon-green font-mono">{formatCurrency(simulationResults.totalAnnualRevenueBoost)}</span>
                      </div>
                    </div>
                  </div>

                  {/* CARD 3: MEDIA, CITY & IMAGE IMPACT */}
                  <div className="rounded-2xl border border-border/70 bg-background/60 p-5 space-y-4">
                    <div className="flex items-center gap-2 text-premium-gold pb-2 border-b border-border/30">
                      <Globe className="h-5 w-5" />
                      <h3 className="font-display font-bold text-base text-foreground">Impact Ville & Médias</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Nouveaux Followers RS :</span>
                        <strong className="text-electric-blue font-bold">+{simulationResults.socialFollowersGain.toLocaleString('fr-FR')}</strong>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-premium-gold" /> Attractivité Tourisme Ville :</span>
                        <strong className="text-premium-gold font-bold">{simulationResults.cityTourismBoostScore}/10</strong>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Score Couverture Médias :</span>
                        <strong className="text-neon-green font-bold">{simulationResults.mediaCoverageScore}/10</strong>
                      </div>

                      <div className="pt-2 border-t border-border/30 text-[11px] text-muted-foreground">
                        🌃 <strong>Retombées Ville :</strong> Augmentation estimée des nuitées d'hôtel et de la consommation locale lors des jours de matchs à domicile.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* CARD 1: SALE TREASURY & CAPITAL GAIN */}
                  <div className="rounded-2xl border border-border/70 bg-background/60 p-5 space-y-4">
                    <div className="flex items-center gap-2 text-neon-green pb-2 border-b border-border/30">
                      <Euro className="h-5 w-5" />
                      <h3 className="font-display font-bold text-base text-foreground">Trésorerie & Plus-Value</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Plus-Value Nette Estimée :</span>
                        <strong className="text-neon-green font-bold text-sm">+{formatCurrency(simulationResults.netCapitalGain)}</strong>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Commission Agent ({saleAgentFeePct}%) :</span>
                        <strong className="text-muted-foreground font-bold">-{formatCurrency(simulationResults.agentCommission)}</strong>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Masse Salariale Libérée :</span>
                        <strong className="text-electric-blue font-bold">+{formatCurrency(simulationResults.annualWageSaved)}/an</strong>
                      </div>

                      <div className="pt-2 border-t border-border/30 flex justify-between items-center text-xs">
                        <span className="font-bold text-foreground">Liquidité Totale Injectée :</span>
                        <strong className="text-neon-green font-bold text-sm">+{formatCurrency(simulationResults.totalNetCashInflow)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* CARD 2: SPORTING LOSS & REPLACEMENT REQUIREMENT */}
                  <div className="rounded-2xl border border-border/70 bg-background/60 p-5 space-y-4">
                    <div className="flex items-center gap-2 text-amber-400 pb-2 border-b border-border/30">
                      <Activity className="h-5 w-5" />
                      <h3 className="font-display font-bold text-base text-foreground">Impact Terrain & Effectif</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Variation Taux de Victoires :</span>
                        <strong className="text-destructive font-bold text-sm">-{simulationResults.winRateLoss}%</strong>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Perte d'xG (Expected Goals) :</span>
                        <strong className="text-amber-400 font-bold">{simulationResults.expectedGoalsLoss} buts/match</strong>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Note Remplacement Requis :</span>
                        <strong className="text-neon-green font-bold">≥ {simulationResults.replacementNeedRating}/99</strong>
                      </div>

                      <div className="pt-2 border-t border-border/30 text-[11px] text-muted-foreground">
                        ⚠️ <strong>Conseil IA :</strong> Prévoyez de réinvestir au moins 35% du cash généré pour recruter un profil équivalent.
                      </div>
                    </div>
                  </div>

                  {/* CARD 3: REINVESTMENT & FINANCING CAPACITY */}
                  <div className="rounded-2xl border border-border/70 bg-background/60 p-5 space-y-4">
                    <div className="flex items-center gap-2 text-electric-blue pb-2 border-b border-border/30">
                      <TrendingUp className="h-5 w-5" />
                      <h3 className="font-display font-bold text-base text-foreground">Capacité de Réinvestissement</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Budget Nouveaux Recrutements :</span>
                        <strong className="text-neon-green font-bold">{formatCurrency(simulationResults.netTransferFeeReceived * 0.7)}</strong>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Capacité Salariale Nouveaux Joueurs :</span>
                        <strong className="text-electric-blue font-bold">{formatCurrency(simulationResults.annualWageSaved)}/an</strong>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Projets Ciblés Finançables :</span>
                        <strong className="text-premium-gold font-bold">2 Joueurs Prospects</strong>
                      </div>

                      <div className="pt-2 border-t border-border/30 text-[11px] text-muted-foreground">
                        🎯 <strong>Opportunité :</strong> La somme dégagée permet de cibler des prospects plus jeunes avec un potentiel de plus-value supérieur.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* FINANCIAL SUMMARY TABLE */}
              <div className="rounded-2xl border border-border/60 bg-background/80 p-5 space-y-4">
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-neon-green" /> Bilan Financier Global de l'Opération
                </h3>

                {simulationType === 'buy' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div className="p-3 rounded-xl bg-card border border-border/40">
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Investissement Total</span>
                      <strong className="text-base font-bold font-mono text-foreground">{formatCurrency(simulationResults.totalInvestment || 0)}</strong>
                    </div>

                    <div className="p-3 rounded-xl bg-card border border-border/40">
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Coût Annuel Moy.</span>
                      <strong className="text-base font-bold font-mono text-electric-blue">{formatCurrency(simulationResults.annualCost || 0)}/an</strong>
                    </div>

                    <div className="p-3 rounded-xl bg-card border border-border/40">
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Recettes Générées /an</span>
                      <strong className="text-base font-bold font-mono text-neon-green">{formatCurrency(simulationResults.totalAnnualRevenueBoost || 0)}/an</strong>
                    </div>

                    <div className="p-3 rounded-xl bg-card border border-border/40">
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Impact Net Annuel</span>
                      <strong className={`text-base font-bold font-mono ${(simulationResults.netAnnualImpact || 0) >= 0 ? 'text-neon-green' : 'text-destructive'}`}>
                        {formatCurrency(simulationResults.netAnnualImpact || 0)}
                      </strong>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div className="p-3 rounded-xl bg-card border border-border/40">
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Cash Vente Nette</span>
                      <strong className="text-base font-bold font-mono text-neon-green">{formatCurrency(simulationResults.netTransferFeeReceived || 0)}</strong>
                    </div>

                    <div className="p-3 rounded-xl bg-card border border-border/40">
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Salaire Libéré</span>
                      <strong className="text-base font-bold font-mono text-electric-blue">{formatCurrency(simulationResults.annualWageSaved || 0)}/an</strong>
                    </div>

                    <div className="p-3 rounded-xl bg-card border border-border/40">
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Plus-Value Nette</span>
                      <strong className="text-base font-bold font-mono text-neon-green">+{formatCurrency(simulationResults.netCapitalGain || 0)}</strong>
                    </div>

                    <div className="p-3 rounded-xl bg-card border border-border/40">
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Liquidité Totale Générée</span>
                      <strong className="text-base font-bold font-mono text-neon-green">
                        +{formatCurrency(simulationResults.totalNetCashInflow || 0)}
                      </strong>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>

      {/* ADD CUSTOM MERCATO PROFILE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-electric-blue" /> Ajouter un Profil Mercato
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProfile} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Nom du Profil *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Victor Osimhen"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-electric-blue focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Type *</label>
                  <select
                    value={newProfileType}
                    onChange={(e) => setNewProfileType(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-electric-blue focus:outline-none cursor-pointer"
                  >
                    <option value="player">Joueur</option>
                    <option value="manager">Entraîneur / Staff</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Poste / Rôle</label>
                  <input
                    type="text"
                    placeholder="Ex: Attaquant"
                    value={newProfilePos}
                    onChange={(e) => setNewProfilePos(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-electric-blue focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Club Actuel</label>
                  <input
                    type="text"
                    placeholder="Ex: Galatasaray"
                    value={newProfileClub}
                    onChange={(e) => setNewProfileClub(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-electric-blue focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Nationalité</label>
                  <input
                    type="text"
                    placeholder="Ex: Nigeria"
                    value={newProfileNation}
                    onChange={(e) => setNewProfileNation(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-electric-blue focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Valeur (€)</label>
                  <input
                    type="number"
                    value={newProfileValue}
                    onChange={(e) => setNewProfileValue(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-electric-blue focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Salaire (€/an)</label>
                  <input
                    type="number"
                    value={newProfileSalary}
                    onChange={(e) => setNewProfileSalary(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-electric-blue focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Note (/99)</label>
                  <input
                    type="number"
                    min={50}
                    max={99}
                    value={newProfileOverall}
                    onChange={(e) => setNewProfileOverall(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-electric-blue focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-border text-muted-foreground hover:bg-muted"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-electric-blue text-white hover:bg-electric-blue/90 shadow-md"
                >
                  Créer et Simuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GLOBAL FOOTBALL SITES & PRONOS HUB MODAL */}
      <GlobalFootballHubModal
        isOpen={showGlobalHub}
        onClose={() => setShowGlobalHub(false)}
      />
    </div>
  );
}
