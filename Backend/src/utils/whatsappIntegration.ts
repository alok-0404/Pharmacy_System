import { env } from '../config/env';

const PLACEHOLDER_VALUES = new Set([
  'your-meta-access-token',
  'your-webhook-verify-token',
]);

export interface WhatsappIntegrationStatus {
  connected: boolean;
  serverTokenConfigured: boolean;
  pharmacyNumberConfigured: boolean;
}

export function isServerWhatsappConfigured(): boolean {
  return (
    Boolean(env.META_ACCESS_TOKEN) &&
    !PLACEHOLDER_VALUES.has(env.META_ACCESS_TOKEN) &&
    Boolean(env.META_VERIFY_TOKEN) &&
    !PLACEHOLDER_VALUES.has(env.META_VERIFY_TOKEN)
  );
}

export function isPharmacyWhatsappConfigured(pharmacy: {
  whatsappPhoneNumberId?: string;
  businessAccountId?: string;
}): boolean {
  const phoneNumberId = pharmacy.whatsappPhoneNumberId?.trim();
  const businessAccountId = pharmacy.businessAccountId?.trim();

  if (!phoneNumberId || !businessAccountId) {
    return false;
  }

  return !phoneNumberId.startsWith('pending-wa') && !businessAccountId.startsWith('pending-biz');
}

export function getWhatsappIntegrationStatus(pharmacy: {
  whatsappPhoneNumberId?: string;
  businessAccountId?: string;
}): WhatsappIntegrationStatus {
  const serverTokenConfigured = isServerWhatsappConfigured();
  const pharmacyNumberConfigured = isPharmacyWhatsappConfigured(pharmacy);

  return {
    connected: serverTokenConfigured && pharmacyNumberConfigured,
    serverTokenConfigured,
    pharmacyNumberConfigured,
  };
}
