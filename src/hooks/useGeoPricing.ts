import { useState, useEffect } from 'react';
import type { GeoPricing, Currency } from '@/types';
import { PRICING_BY_ZONE, CLUB_PRO_PRICING_BY_ZONE, CFA_COUNTRY_CODES } from '@/types';

async function detectGeoZone(): Promise<Currency> {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (!res.ok) throw new Error('Geo API failed');
    const data = await res.json();
    const countryCode: string = data.country_code || '';

    // Europe → EUR
    const euCountries = new Set([
      'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT',
      'LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','GB','CH','NO',
    ]);
    if (euCountries.has(countryCode)) return 'EUR';

    // CFA zone → XOF
    if (CFA_COUNTRY_CODES.has(countryCode)) return 'XOF';

    return 'USD';
  } catch {
    return 'USD';
  }
}

const CACHE_KEY = 'kronosnp_geo_pricing';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export function useGeoPricing(): { 
  pricing: GeoPricing; 
  clubProPricing: GeoPricing;
  isLoading: boolean; 
  refresh: () => void 
} {
  const [pricing, setPricing] = useState<GeoPricing>(PRICING_BY_ZONE.USD);
  const [clubProPricing, setClubProPricing] = useState<GeoPricing>(CLUB_PRO_PRICING_BY_ZONE.USD);
  const [isLoading, setIsLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.t < CACHE_TTL && PRICING_BY_ZONE[parsed.c as Currency]) {
          const curr = parsed.c as Currency;
          setPricing(PRICING_BY_ZONE[curr]);
          setClubProPricing(CLUB_PRO_PRICING_BY_ZONE[curr] || CLUB_PRO_PRICING_BY_ZONE.USD);
          setIsLoading(false);
          return;
        }
      } catch { /* stale cache, fetch fresh */ }
    }

    detectGeoZone().then((currency) => {
      setPricing(PRICING_BY_ZONE[currency]);
      setClubProPricing(CLUB_PRO_PRICING_BY_ZONE[currency] || CLUB_PRO_PRICING_BY_ZONE.USD);
      localStorage.setItem(CACHE_KEY, JSON.stringify({ c: currency, t: Date.now() }));
    }).finally(() => setIsLoading(false));
  }, [tick]);

  const refresh = () => {
    // Manual override: cycle XOF → EUR → USD so users in mixed zones can pick the right currency
    const order: Currency[] = ['USD', 'EUR', 'XOF'];
    const idx = order.indexOf(pricing.currency);
    const next = order[(idx + 1) % order.length];
    setPricing(PRICING_BY_ZONE[next]);
    setClubProPricing(CLUB_PRO_PRICING_BY_ZONE[next] || CLUB_PRO_PRICING_BY_ZONE.USD);
    localStorage.setItem(CACHE_KEY, JSON.stringify({ c: next, t: Date.now() }));
    setTick(t => t + 1);
  };

  return { pricing, clubProPricing, isLoading, refresh };
}

export function formatPrice(amount: number, currency: Currency): string {
  if (currency === 'XOF') {
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  }
  if (currency === 'EUR') {
    return `${amount.toFixed(2).replace('.', ',')} €`;
  }
  return `$${amount.toFixed(2)}`;
}
