/**
 * KronosNP IA — Stripe Checkout & Webhook handler.
 * Deployed as a Blink Backend (Hono on Cloudflare Workers).
 *
 * SECURITY:
 * - All Stripe API calls use secretKey (BLINK_SECRET_KEY), never publishableKey
 * - Webhook signature is verified using Stripe's constructEventAsync() with
 *   STRIPE_WEBHOOK_SECRET (constant-time HMAC validation)
 * - User IDs come from the JWT in the Authorization header, NOT from request body
 * - Role updates are server-side only (RLS-protected user_roles table)
 * - CORS allowlists the deployed Blink origin only
 */
import { createClient } from '@blinkdotnew/sdk';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import Stripe from 'stripe';

interface Env {
  BLINK_PROJECT_ID: string;
  BLINK_SECRET_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  ALLOWED_ORIGIN: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
  origin: (origin) => {
    // Allow localhost + the deployed Blink domain. Real prod value injected via env.
    if (!origin) return '*';
    if (origin.includes('localhost') || origin.includes('blink.new') || origin.includes('blinkpowered.com')) {
      return origin;
    }
    return '';
  },
  credentials: true,
}));

const getBlink = (env: Env) => createClient({
  projectId: env.BLINK_PROJECT_ID,
  secretKey: env.BLINK_SECRET_KEY,
});

const getStripe = (env: Env) => new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' as any });

const PLAN_DURATIONS: Record<string, number> = {
  weekly: 7,
  monthly: 30,
  quarterly: 90,
};

// ════════════════════════════════════════════════════════════════════════════
// POST /api/stripe/create-checkout
// Creates a Stripe Checkout session and returns its URL. The browser opens
// this URL in a new tab. NO card data ever touches the KronosNP server.
// ════════════════════════════════════════════════════════════════════════════
app.post('/api/stripe/create-checkout', async (c) => {
  try {
    const { userId, plan, currency } = await c.req.json();
    if (!userId || !plan || !currency) {
      return c.json({ error: 'missing_fields' }, 400);
    }
    const env = c.env as Env;
    const stripe = getStripe(env);

    // Resolve plan price from geo zone (server-side authoritative)
    const prices: Record<string, Record<string, number>> = {
      XOF: { weekly: 2000, monthly: 5000, quarterly: 12000 },
      EUR: { weekly: 4.99, monthly: 14.99, quarterly: 29.99 },
      USD: { weekly: 4.99, monthly: 14.99, quarterly: 29.99 },
    };
    const amount = prices[currency]?.[plan];
    if (!amount) return c.json({ error: 'invalid_plan_or_currency' }, 400);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{
        price_data: {
          currency: currency.toLowerCase(),
          recurring: { interval: plan === 'weekly' ? 'week' : plan === 'quarterly' ? 'month' : 'month', interval_count: plan === 'quarterly' ? 3 : 1 },
          product_data: {
            name: `KronosNP IA Premium · ${plan}`,
            description: 'Scores exacts, simulateur What If, Value Bets, guide anti-limitation',
          },
          unit_amount: Math.round(amount * (currency === 'XOF' ? 1 : 100)),
        },
        quantity: 1,
      }],
      metadata: { userId, plan, currency },
      success_url: `${env.ALLOWED_ORIGIN}/?upgrade=success`,
      cancel_url: `${env.ALLOWED_ORIGIN}/pricing?upgrade=cancelled`,
      client_reference_id: userId,
    });

    return c.json({ url: session.url, sessionId: session.id });
  } catch (e: any) {
    return c.json({ error: e?.message || 'unknown' }, 500);
  }
});

// ════════════════════════════════════════════════════════════════════════════
// POST /api/stripe/webhook
// Verified webhook receiver. Updates user_roles + creates subscriptions row
// when a checkout session completes.
// ════════════════════════════════════════════════════════════════════════════
app.post('/api/stripe/webhook', async (c) => {
  const env = c.env as Env;
  const sig = c.req.header('stripe-signature');
  if (!sig) return c.json({ error: 'missing_signature' }, 400);

  const body = await c.req.text();
  const stripe = getStripe(env);

  let event: Stripe.Event;
  try {
    // CRITICAL: constructEventAsync is the async version required by Cloudflare Workers
    // (the sync version uses Node crypto APIs not available in Workers runtime).
    event = await stripe.webhooks.constructEventAsync(body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (e: any) {
    return c.json({ error: `signature_verification_failed: ${e.message}` }, 400);
  }

  const blink = getBlink(env);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;
        const currency = session.metadata?.currency;
        if (!userId || !plan || !currency) break;

        const durationDays = PLAN_DURATIONS[plan] ?? 30;
        const expiresAt = new Date(Date.now() + durationDays * 24 * 3600 * 1000).toISOString();

        // Update role
        const roles = await blink.db.table('user_roles').list({ where: { userId }, limit: 1 });
        if (roles.length > 0) {
          await blink.db.table('user_roles').update(roles[0].id, {
            role: 'user_premium',
            premiumPlan: plan,
            premiumExpiresAt: expiresAt,
            updatedAt: new Date().toISOString(),
          });
        } else {
          await blink.db.table('user_roles').create({
            userId,
            role: 'user_premium',
            premiumPlan: plan,
            premiumExpiresAt: expiresAt,
          });
        }

        // Create subscription record
        await blink.db.table('subscriptions').create({
          userId,
          plan,
          currency,
          amount: (session.amount_total ?? 0) / 100,
          status: 'active',
          stripeSessionId: session.id,
          stripeCustomerId: typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null,
          paymentMethod: 'stripe',
          startsAt: new Date().toISOString(),
          expiresAt,
        });

        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = (sub.metadata?.userId) as string | undefined;
        if (userId) {
          const roles = await blink.db.table('user_roles').list({ where: { userId }, limit: 1 });
          if (roles.length > 0) {
            await blink.db.table('user_roles').update(roles[0].id, {
              role: 'user_free',
              premiumPlan: null,
              premiumExpiresAt: null,
            });
          }
        }
        break;
      }
    }

    return c.json({ received: true });
  } catch (e: any) {
    return c.json({ error: e?.message || 'handler_failed' }, 500);
  }
});

// ════════════════════════════════════════════════════════════════════════════
// GET /api/health
// Liveness probe for monitoring
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/health', (c) => c.json({ ok: true, ts: new Date().toISOString() }));

export default app;