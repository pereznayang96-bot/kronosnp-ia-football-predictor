import React, { useState } from 'react';
import {
  Globe, ExternalLink, Search, Flame, Newspaper, TrendingUp,
  Award, Zap, Layers, ChevronRight, Bookmark, Sparkles, Filter
} from 'lucide-react';

export interface FootballSource {
  id: string;
  name: string;
  url: string;
  category: 'mercato' | 'news' | 'pronos_stats' | 'official' | 'tv_broadcast';
  region: 'europe' | 'afrique' | 'asie' | 'ameriques' | 'mondial';
  country: string;
  flag: string;
  description: string;
  badge?: string;
  isPopular?: boolean;
}

export const GLOBAL_FOOTBALL_SOURCES: FootballSource[] = [
  // ── MERCATO & TRANSFERTS ──
  {
    id: 'transfermarkt',
    name: 'Transfermarkt',
    url: 'https://www.transfermarkt.fr',
    category: 'mercato',
    region: 'mondial',
    country: 'Allemagne / Mondial',
    flag: '🌐',
    description: 'La référence mondiale des valeurs marchandes, rumeurs de transfert, contrats et données de joueurs.',
    badge: 'Incontournable',
    isPopular: true,
  },
  {
    id: 'transfermarkt-neuestetransfers',
    name: 'Transfermarkt — Derniers Transferts',
    url: 'https://www.transfermarkt.fr/statistik/neuestetransfers',
    category: 'mercato',
    region: 'mondial',
    country: 'International',
    flag: '📊',
    description: 'Le tableau officiel des derniers transferts validés, prêts et officialisations du mercato mondial.',
    badge: 'Officialisations',
    isPopular: true,
  },
  {
    id: 'footmercato',
    name: 'Foot Mercato',
    url: 'https://www.footmercato.net/',
    category: 'mercato',
    region: 'europe',
    country: 'France / Europe',
    flag: '🇫🇷',
    description: 'Actualités des transferts en temps réel, rumeurs exclusives et suivi du mercato européen et mondial.',
    badge: 'En Direct',
    isPopular: true,
  },
  {
    id: 'mercatolive',
    name: 'Mercato Live',
    url: 'https://mercatolive.fr/',
    category: 'mercato',
    region: 'europe',
    country: 'France / Europe',
    flag: '🔥',
    description: 'Le fil d’actualité des transferts en direct 24/7, rumeurs, officialisations et signatures.',
    badge: 'Mercato 24/7',
    isPopular: true,
  },
  {
    id: 'fabrizio-romano',
    name: 'Fabrizio Romano (CaughtOffside)',
    url: 'https://www.caughtoffside.com/tags/fabrizio-romano/',
    category: 'mercato',
    region: 'mondial',
    country: 'Italie / International',
    flag: '🇮🇹',
    description: 'Breaking news mercato, formules "Here We Go" et révélations sur les négociations de contrats.',
    badge: 'Here We Go',
    isPopular: true,
  },
  {
    id: 'mercato365',
    name: 'Mercato 365',
    url: 'https://www.football365.fr/mercato/',
    category: 'mercato',
    region: 'europe',
    country: 'France',
    flag: '🇫🇷',
    description: 'Suivi continu 24/7 des signatures, prêts, prolongations de contrats et départs.',
  },

  // ── AFRIQUE (CAF) ──
  {
    id: 'afrik-foot',
    name: 'Afrik-Foot',
    url: 'https://www.afrik-foot.com',
    category: 'news',
    region: 'afrique',
    country: 'Afrique Global',
    flag: '🌍',
    description: 'Le premier quotidien d’actualité du football africain, CAN, CHAN, Champions League CAF et expatriés.',
    badge: 'N°1 Afrique',
    isPopular: true,
  },
  {
    id: 'africafoot',
    name: 'AfricaFoot',
    url: 'https://africafoot.com/',
    category: 'news',
    region: 'afrique',
    country: 'Afrique / Mercato Africain',
    flag: '🌍',
    description: 'Le portail de référence de l’actualité, du mercato et des talents du football africain.',
    badge: 'Nouveauté',
    isPopular: true,
  },
  {
    id: 'foot-africa',
    name: 'Foot Africa',
    url: 'https://foot-africa.com',
    category: 'news',
    region: 'afrique',
    country: 'Afrique',
    flag: '🌍',
    description: 'Analyses, classements des meilleurs buteurs africains, interviews et couverture complète des sélections.',
    isPopular: true,
  },
  {
    id: 'kingfut',
    name: 'KingFut (Égypte & MENA)',
    url: 'https://www.kingfut.com',
    category: 'news',
    region: 'afrique',
    country: 'Égypte / MENA',
    flag: '🇪🇬',
    description: 'Spécialiste du football égyptien, de la Premier League Égyptienne et des stars du Moyen-Orient.',
  },
  {
    id: 'kickoff-sa',
    name: 'KickOff South Africa',
    url: 'https://www.snl24.com/kickoff',
    category: 'news',
    region: 'afrique',
    country: 'Afrique du Sud',
    flag: '🇿🇦',
    description: 'Toute l’actualité de la PSL (South African Premier Division) et des clubs d’Afrique Australe.',
  },
  {
    id: 'caf-official',
    name: 'CAF Online Official',
    url: 'https://www.cafonline.com',
    category: 'official',
    region: 'afrique',
    country: 'Confédération Africaine',
    flag: '🏆',
    description: 'Site officiel de la CAF : tirages au sort, résultats officiels de la CAN et compétitions interclubs.',
  },

  // ── EUROPE (UEFA) ──
  {
    id: 'lequipe',
    name: 'L’Équipe',
    url: 'https://www.lequipe.fr/Football/',
    category: 'news',
    region: 'europe',
    country: 'France',
    flag: '🇫🇷',
    description: 'Le grand quotidien sportif français : Ligue 1, Ligue des Champions, Équipe de France et analyses.',
    isPopular: true,
  },
  {
    id: 'sky-sports',
    name: 'Sky Sports Football',
    url: 'https://www.skysports.com/football',
    category: 'news',
    region: 'europe',
    country: 'Royaume-Uni',
    flag: '🇬🇧',
    description: 'Couverture d’élite de la Premier League anglaise, Championship, interviews exclusives et vidéos.',
    badge: 'Premier League',
    isPopular: true,
  },
  {
    id: 'marca',
    name: 'Marca',
    url: 'https://www.marca.com/futbol.html',
    category: 'news',
    region: 'europe',
    country: 'Espagne',
    flag: '🇪🇸',
    description: 'Le journal sportif le plus lu en Espagne : Real Madrid, FC Barcelone, LaLiga et mercato espagnol.',
    isPopular: true,
  },
  {
    id: 'gazzetta',
    name: 'La Gazzetta dello Sport',
    url: 'https://www.gazzetta.it/Calcio/',
    category: 'news',
    region: 'europe',
    country: 'Italie',
    flag: '🇮🇹',
    description: 'Le quotidien rose italien emblématique pour tout savoir sur la Serie A, Juventus, Inter et Milan AC.',
  },
  {
    id: 'bild-sport',
    name: 'Bild Sport Football',
    url: 'https://www.bild.de/sport/fussball/fussball-home-54911438.bild.html',
    category: 'news',
    region: 'europe',
    country: 'Allemagne',
    flag: '🇩🇪',
    description: 'Actu et scoops Bundesliga, Bayern Munich, Borussia Dortmund et Mannschaft.',
  },
  {
    id: 'bbc-sport',
    name: 'BBC Sport Football',
    url: 'https://www.bbc.com/sport/football',
    category: 'news',
    region: 'europe',
    country: 'Royaume-Uni / International',
    flag: '🇬🇧',
    description: 'Rapports de matchs rigoureux, analyses tactiques neutres et directs des plus grands tournois.',
  },

  // ── ASIE & MOYEN-ORIENT (AFC) ──
  {
    id: 'afc-official',
    name: 'AFC Official (Asian Football)',
    url: 'https://www.the-afc.com',
    category: 'official',
    region: 'asie',
    country: 'Confédération Asiatique',
    flag: '🌏',
    description: 'Site officiel de l’AFC : Asian Cup, AFC Champions League Elite et qualifications Coupe du Monde.',
    badge: 'AFC Officiel',
  },
  {
    id: 'saudi-pro-league',
    name: 'Saudi Pro League Official',
    url: 'https://spl.com.sa',
    category: 'news',
    region: 'asie',
    country: 'Arabie Saoudite',
    flag: '🇸🇦',
    description: 'Actualités, effectifs et statistiques du championnat saoudien (Al-Nassr, Al-Hilal, Al-Ittihad).',
    isPopular: true,
  },
  {
    id: 'goal-asia',
    name: 'Goal Asia',
    url: 'https://www.goal.com/en-sg',
    category: 'news',
    region: 'asie',
    country: 'Asie du Sud-Est & Est',
    flag: '🇸🇬',
    description: 'Couverture dédiée aux ligues d’Asie : J.League (Japon), K League (Corée), Super League Chinoise.',
  },
  {
    id: 'dongqiudi',
    name: 'Dongqiudi (懂球帝)',
    url: 'https://www.dongqiudi.com',
    category: 'news',
    region: 'asie',
    country: 'Chine / Asie',
    flag: '🇨🇳',
    description: 'La plus grande plateforme communautaire d’actualités football et stats en Chine.',
  },

  // ── AMÉRIQUES (CONMEBOL & CONCACAF) ──
  {
    id: 'tyc-sports',
    name: 'TyC Sports',
    url: 'https://www.tycsports.com/futbol.html',
    category: 'news',
    region: 'ameriques',
    country: 'Argentine',
    flag: '🇦🇷',
    description: 'Référence du football argentin, Selección Albiceleste, Copa Libertadores et Liga Profesional.',
    isPopular: true,
  },
  {
    id: 'globo-esporte',
    name: 'Globo Esporte (GE)',
    url: 'https://ge.globo.com/futebol/',
    category: 'news',
    region: 'ameriques',
    country: 'Brésil',
    flag: '🇧🇷',
    description: 'Le média géant brésilien : Brasileirão, Seleção, Flamengo, Palmeiras et jeunes talents.',
    isPopular: true,
  },
  {
    id: 'mls-soccer',
    name: 'MLS Soccer Official',
    url: 'https://www.mlssoccer.com',
    category: 'news',
    region: 'ameriques',
    country: 'États-Unis / Canada',
    flag: '🇺🇸',
    description: 'Site officiel de la Major League Soccer : Inter Miami, Messi, faits saillants et transferts MLS.',
  },
  {
    id: 'diario-ole',
    name: 'Diario Olé',
    url: 'https://www.ole.com.ar',
    category: 'news',
    region: 'ameriques',
    country: 'Argentine / Amérique Latine',
    flag: '🇦🇷',
    description: 'Le journal sportif passionné d’Amérique du Sud pour suivre Boca Juniors, River Plate et les stars latines.',
  },

  // ── DATA, STATS & PRONOSTICS ──
  {
    id: 'sofascore',
    name: 'SofaScore Live',
    url: 'https://www.sofascore.com/fr/',
    category: 'pronos_stats',
    region: 'mondial',
    country: 'Mondial',
    flag: '📈',
    description: 'Notes de joueurs en direct, cartes de chaleur, compositions d’équipes et statistiques avancées.',
    badge: 'Stats Live',
    isPopular: true,
  },
  {
    id: 'whoscored',
    name: 'WhoScored',
    url: 'https://www.whoscored.com',
    category: 'pronos_stats',
    region: 'mondial',
    country: 'Mondial',
    flag: '📊',
    description: 'Opta data, caractéristiques des équipes, forces/faiblesses tactiques et prédictions de matchs.',
    isPopular: true,
  },
  {
    id: 'flashscore',
    name: 'Flashscore / FlashResultats',
    url: 'https://www.flashscore.fr/',
    category: 'pronos_stats',
    region: 'mondial',
    country: 'France / Mondial',
    flag: '⚡',
    description: 'Résultats en direct, notifications de buts instantanées, cotes et statistiques H2H de plus de 1000 compétitions.',
    badge: 'Direct 1000+ Ligues',
    isPopular: true,
  },
  {
    id: 'fbref',
    name: 'FBref (Stats & Analytics)',
    url: 'https://fbref.com',
    category: 'pronos_stats',
    region: 'mondial',
    country: 'Mondial',
    flag: '🔢',
    description: 'Base de données d’analyse avancée : xG, xAG, pressions, npass et statistiques détaillées par saison.',
  },
  {
    id: 'understat',
    name: 'Understat (xG Data)',
    url: 'https://understat.com',
    category: 'pronos_stats',
    region: 'europe',
    country: 'Europe',
    flag: '🎯',
    description: 'Modèle visuel d’Expected Goals (xG) par match et par tir dans les 5 grands championnats européens.',
  },
  {
    id: 'oddschecker',
    name: 'Oddschecker',
    url: 'https://www.oddschecker.com/football',
    category: 'pronos_stats',
    region: 'mondial',
    country: 'International',
    flag: '💰',
    description: 'Comparateur de cotes mondial pour trouver les meilleures valeurs sur tous les matchs.',
  },
  {
    id: 'betclic',
    name: 'Betclic Football',
    url: 'https://www.betclic.fr',
    category: 'pronos_stats',
    region: 'europe',
    country: 'France / Europe',
    flag: '🎲',
    description: 'Opérateur officiel de paris sportifs, cotes boostées, Cash Out et streaming des rencontres.',
    badge: 'Cotes Live',
    isPopular: true,
  },
  {
    id: 'napoleon',
    name: 'Napoleon Sports & Games',
    url: 'https://www.napoleon.be',
    category: 'pronos_stats',
    region: 'europe',
    country: 'Belgique / Europe',
    flag: '👑',
    description: 'Plateforme leader de paris sportifs et cotes en direct pour les championnats belges et européens.',
    badge: 'Bookmaker Belge',
    isPopular: true,
  },
  {
    id: 'winamax',
    name: 'Winamax Sport',
    url: 'https://www.winamax.fr',
    category: 'pronos_stats',
    region: 'europe',
    country: 'France',
    flag: '🎯',
    description: 'Cotes parmi les plus élevées du marché, MyMatch, paris combinés et statistiques des matchs.',
  },
  {
    id: 'unibet',
    name: 'Unibet Sports',
    url: 'https://www.unibet.fr',
    category: 'pronos_stats',
    region: 'europe',
    country: 'Europe',
    flag: '🟢',
    description: 'Offre complète de paris sportifs en direct, Unibet TV et analyses approfondies d’avant-match.',
  },

  // ── DIFFUSION TV, DIRECTS & CHAÎNES SPORT ──
  {
    id: 'matchendirect',
    name: 'MatchEnDirect.fr',
    url: 'https://www.matchendirect.fr',
    category: 'tv_broadcast',
    region: 'mondial',
    country: 'France / Mondial',
    flag: '📺',
    description: 'Programme TV foot, résultats en direct, compositions d’équipes et statistiques en temps réel.',
    badge: 'Programme TV',
    isPopular: true,
  },
  {
    id: 'canal-plus-sport',
    name: 'Canal+ Sport Football',
    url: 'https://www.canalplus.com/sport/football',
    category: 'tv_broadcast',
    region: 'europe',
    country: 'France / Europe',
    flag: '📺',
    description: 'Diffuseur officiel de l’UEFA Champions League, Premier League et grands chocs européens.',
    badge: 'Diffuseur Officiel',
    isPopular: true,
  },
  {
    id: 'bein-sports',
    name: 'beIN Sports Football',
    url: 'https://www.beinsports.com',
    category: 'tv_broadcast',
    region: 'mondial',
    country: 'France / MENA / Mondial',
    flag: '🟣',
    description: 'Couverture en direct de la Ligue 2, LaLiga, Serie A, Süper Lig et compétitions internationales.',
    badge: 'Directs Multi-Ligues',
    isPopular: true,
  },
  {
    id: 'rmc-sport',
    name: 'RMC Sport Football',
    url: 'https://rmcsport.bfmtv.com/football/',
    category: 'tv_broadcast',
    region: 'europe',
    country: 'France',
    flag: '🎙️',
    description: 'Actualités chaudes, émissions en direct (After Foot), débats tactiques et podcasts.',
    isPopular: true,
  },
  {
    id: 'eurosport-foot',
    name: 'Eurosport Football',
    url: 'https://www.eurosport.fr/football/',
    category: 'tv_broadcast',
    region: 'europe',
    country: 'Europe',
    flag: '⭐',
    description: 'Directs, vidéos, résumés des rencontres et classements de tous les championnats majeurs.',
  },
  {
    id: 'lequipe-tv',
    name: 'La Chaîne L\'Équipe (TV)',
    url: 'https://www.lequipe.fr/tv/',
    category: 'tv_broadcast',
    region: 'europe',
    country: 'France',
    flag: '📺',
    description: 'La chaîne TV 100% sport gratuite : L\'Équipe du Soir, débats, directs et résumés vidéo.',
  },
  {
    id: 'besoccer',
    name: 'BeSoccer',
    url: 'https://www.besoccer.com',
    category: 'tv_broadcast',
    region: 'mondial',
    country: 'Mondial',
    flag: '⚽',
    description: 'Base de données mondiale de résultats, calendriers, diffusion TV et flux d’actualités football.',
    badge: 'Base Mondiale',
  },
];

export function GlobalFootballHubModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const filteredSources = GLOBAL_FOOTBALL_SOURCES.filter(source => {
    const matchesSearch = source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          source.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          source.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === 'all' || source.region === selectedRegion || source.region === 'mondial';
    const matchesCategory = selectedCategory === 'all' || source.category === selectedCategory;
    return matchesSearch && matchesRegion && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-3xl border border-electric-blue/40 bg-card p-6 md:p-8 shadow-2xl overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-electric-blue/15 border border-electric-blue/30 text-electric-blue">
              <Globe className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-neon-green/30 bg-neon-green/10 px-3 py-0.5 text-[11px] font-bold text-neon-green mb-1">
                <Sparkles className="h-3 w-3" /> Hub Global Media & Pronos
              </div>
              <h2 className="font-display text-xl md:text-2xl font-extrabold text-foreground">
                Annuaire Mondial des Sites Foot & Pronostics
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="py-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher un site (ex: Transfermarkt, L'Équipe, Afrik-Foot, Sofascore)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background/80 pl-10 pr-4 py-2.5 text-xs md:text-sm font-semibold text-foreground focus:border-electric-blue focus:outline-none"
              />
            </div>

            {/* Category Select */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-2xl border border-border bg-background px-3.5 py-2.5 text-xs font-bold text-foreground focus:border-electric-blue focus:outline-none cursor-pointer"
              >
                <option value="all">Toutes Catégories</option>
                <option value="mercato">🔥 Mercato & Transferts</option>
                <option value="news">📰 Actualités & Médias</option>
                <option value="tv_broadcast">📺 Diffusions TV & Directs</option>
                <option value="pronos_stats">📊 Stats, Bookmakers & Pronos</option>
                <option value="official">🏆 Instances Officielles</option>
              </select>
            </div>
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: '🌍 Tous du Monde', icon: '🌐' },
              { id: 'europe', label: '🇪🇺 Europe (UEFA)', icon: '⚽' },
              { id: 'afrique', label: '🌍 Afrique (CAF)', icon: '🦁' },
              { id: 'asie', label: '🌏 Asie & Moyen-Orient', icon: '⛩️' },
              { id: 'ameriques', label: '🌎 Amériques (CONMEBOL)', icon: '🔥' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedRegion(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedRegion === tab.id
                    ? 'bg-electric-blue text-white shadow-md'
                    : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* SOURCES GRID */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 my-2">
          {filteredSources.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Globe className="h-10 w-10 text-muted-foreground mx-auto opacity-50" />
              <p className="text-sm font-semibold text-muted-foreground">
                Aucun site correspondant à votre recherche "{searchQuery}".
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSources.map(source => (
                <a
                  key={source.id}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-col justify-between p-4 rounded-2xl border border-border/70 bg-background/60 hover:bg-background hover:border-electric-blue/60 transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{source.flag}</span>
                        <h3 className="font-display font-bold text-sm text-foreground group-hover:text-electric-blue transition-colors">
                          {source.name}
                        </h3>
                      </div>
                      {source.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neon-green/15 text-neon-green border border-neon-green/30">
                          {source.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {source.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground font-semibold flex items-center gap-1">
                      {source.country}
                    </span>
                    <span className="text-electric-blue font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Visiter <ExternalLink className="h-3 w-3" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="pt-4 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">{filteredSources.length}</span> sites répertoriés dans l’Annuaire KronosNP IA.
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-muted hover:bg-muted/80 font-bold text-foreground text-xs transition-colors cursor-pointer"
          >
            Fermer le Hub
          </button>
        </div>

      </div>
    </div>
  );
}
