// VB-02: hardcoded API key used to call the "premium features" backend
// endpoint. This constant gets compiled directly into the shipped JS bundle
// at build time - not injected at runtime, not fetched via a secure exchange.
export const PREMIUM_API_KEY = 'sk_live_dvrn_9f8a2c1b4e7d';
