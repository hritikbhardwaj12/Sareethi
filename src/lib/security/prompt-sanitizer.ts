/**
 * Prompt Injection & PII Security Defense Module
 */

const INJECTION_PATTERNS = [
  /ignore\s+all\s+previous\s+instructions/i,
  /override\s+system\s+prompt/i,
  /you\s+are\s+now\s+a/i,
  /act\s+as\s+an\s+unrestricted/i,
  /forget\s+all\s+rules/i,
  /system:\s*/i,
  /sudo\s+/i,
];

export function sanitizeExtractedCatalogueText(rawText: string): string {
  let cleanedText = rawText;

  // Filter known prompt injection attack vectors
  for (const pattern of INJECTION_PATTERNS) {
    cleanedText = cleanedText.replace(pattern, '[REDACTED_PROMPT_INJECTION_ATTEMPT]');
  }

  return cleanedText;
}

export function sanitizeCustomerPiiForAiContext(customer: { name: string; phone: string }): {
  anonymizedName: string;
  maskedPhone: string;
} {
  const nameParts = customer.name.split(' ');
  const anonymizedName = nameParts.length > 1 ? `${nameParts[0]} ${nameParts[1][0]}.` : customer.name;
  const maskedPhone = customer.phone.length >= 10 ? `******${customer.phone.slice(-4)}` : '******0000';

  return { anonymizedName, maskedPhone };
}
