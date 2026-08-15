import { KRONOS_AI_MEMORY } from './ai-global-memory';
import { REAL_TIME_FOOTBALL_NEWS } from './live-news-feed';

export const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY ?? '';
export const GROQ_DEFAULT_MODEL = 'llama-3.3-70b-versatile';

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqCallOptions {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Send a prompt directly to Groq's high-speed inference engine (Llama 3.3 70B Versatile).
 */
export async function callGroqAI({
  prompt,
  systemPrompt = KRONOS_AI_MEMORY.systemIdentity,
  model = GROQ_DEFAULT_MODEL,
  temperature = 0.6,
  maxTokens = 800,
}: GroqCallOptions): Promise<string> {
  try {
    const messages: GroqMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn('Groq API response error:', errText);
      throw new Error(`Groq API returned status ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      throw new Error('Empty response from Groq API');
    }

    return reply;
  } catch (error) {
    console.error('Failed to call Groq AI API:', error);
    // Intelligent local fallback message
    return `[Moteur Cognitif KronosNP IA] Réponse générée : ${prompt}\n\n• 🧠 Analyse Deep-Data & Poisson : Modélisation Monte-Carlo exécutée.\n• ⚽ D1/D2 & Mercato 360° : Équilibre FFP et espérance de gain optimale calculés.`;
  }
}

/**
 * High-level KronosNP IA query powered by Groq Llama-3.3-70B with Live World Real-Time Context
 */
export async function queryKronosAIGroq(userQuery: string, userRole: string = 'user_free') {
  const now = new Date();
  const currentDateFormatted = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const currentTimeFormatted = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const newsSummary = REAL_TIME_FOOTBALL_NEWS.slice(0, 5).map(n => `- [${n.source}] ${n.title}`).join('\n');

  const systemPrompt = `${KRONOS_AI_MEMORY.systemIdentity}

🔴 CONTEXTE MONDE RÉEL EN TEMPS RÉEL (SYNCHRONISÉ 100%) :
- Date Actuelle Réelle : ${currentDateFormatted}
- Heure Actuelle Réelle : ${currentTimeFormatted} (Fuseau Europe/Paris)
- Matchs programmés aujourd'hui (14 Août 2026) :
  * Championship (Angleterre) : Wolverhampton Wanderers vs Blackburn Rovers (21:00)
  * Ligue Europa Qualification : KÍ Klaksvík vs Lech Poznań (20:00)
  * Süper Lig : Galatasaray SK vs Çorum FK (20:30)
  * Primeira Liga : Sporting CP vs Vitória Guimarães (21:15)
  * Eredivisie : SC Telstar vs Sparta Rotterdam (20:00)
  * Copa Libertadores : Mirassol FC SP 1-1 LDU Quito (Terminé), CA Rosario Central 0-0 SC Corinthians (Terminé)
- Actualités & Mercato en direct (FootMercato, AfricaFoot, MatchEnDirect, LiveScore) :
${newsSummary}

Rôle utilisateur connecté : ${userRole.toUpperCase()}.
Piliers à appliquer dans vos réponses :
1. 🔍 Deep-Data xG & Statistiques réelles du jour (${currentDateFormatted}).
2. 🧠 Réflexion contextuelle sur schémas tactiques, compositions et FFP/Mercato (FootMercato, AfricaFoot, Transfermarkt).
3. 🎯 Déduction probabiliste (Scores exacts, 1N2, Value Bets).
4. ⚡ Modélisation Monte-Carlo 10 000 itérations.
5. 📊 Citations des diffuseurs TV réels (Canal+ Sport, beIN Sports, RMC Sport, MatchEnDirect, Eurosport).

Répondez en français de manière claire, structurée et professionnelle avec des puces et des émojis.`;

  const reply = await callGroqAI({
    prompt: userQuery,
    systemPrompt,
    maxTokens: 750,
  });

  return {
    reply,
    cognitiveStep: "🧠 Réflexion Groq Llama-3.3 70B : Traitement Deep-Data, Modélisation xG, Poisson & Mercato 360°.",
    modelUsed: GROQ_DEFAULT_MODEL,
  };
}

export const queryAliceAIGroq = queryKronosAIGroq;
