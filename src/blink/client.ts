import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: import.meta.env.VITE_BLINK_PROJECT_ID || 'kronosnp-ia-platform-3uxlob81',
  publishableKey: import.meta.env.VITE_BLINK_PUBLISHABLE_KEY || 'blnk_pk_BJLyzXAfiLE79rFWZhZwjlA8dlf0AdOQ',
  authRequired: false,
  auth: { mode: 'managed' },
})
