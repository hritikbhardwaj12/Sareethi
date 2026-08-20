/**
 * Idempotency Key Manager for Billing & Invoicing Transactions
 * Prevents duplicate bill/order creation if owner double-clicks
 */

const processedKeys = new Map<string, { result: any; timestamp: number }>();

export function checkBillingIdempotency(key: string) {
  const existing = processedKeys.get(key);
  if (existing) {
    return { isDuplicate: true, cachedResult: existing.result };
  }
  return { isDuplicate: false, cachedResult: null };
}

export function saveBillingIdempotency(key: string, result: any) {
  processedKeys.set(key, { result, timestamp: Date.now() });
}
