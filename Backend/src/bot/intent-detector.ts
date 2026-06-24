import { SERVICE_OPTION_IDS } from './service-menu';

export enum Intent {
  GREETING = 'GREETING',
  UPLOAD_PRESCRIPTION = 'UPLOAD_PRESCRIPTION',
  ORDER_STATUS = 'ORDER_STATUS',
  REFILL_MEDICINE = 'REFILL_MEDICINE',
  MEDICINE_AVAILABILITY = 'MEDICINE_AVAILABILITY',
  REPEAT_ORDER = 'REPEAT_ORDER',
  STORE_INFO = 'STORE_INFO',
  FAQ_SUPPORT = 'FAQ_SUPPORT',
  TALK_PHARMACIST = 'TALK_PHARMACIST',
  SERVICE_MENU = 'SERVICE_MENU',
  GENERAL_MESSAGE = 'GENERAL_MESSAGE',
}

export interface IntentResult {
  intent: Intent;
  confidence: number;
}

export interface IntentDetector {
  detect(message: string, buttonId?: string): IntentResult;
}

const GREETING_PATTERN = /\b(hi|hello|hey|namaste|hola)\b/i;
const MENU_PATTERN = /\b(menu|services|options|help)\b/i;
const UPLOAD_PATTERN = /\b(upload|prescription|recipe)\b/i;
const ORDER_STATUS_PATTERN = /\b(order\s*status|track\s*order|my\s*order)\b/i;
const REFILL_PATTERN = /\b(refill|medicine\s*again)\b/i;
const REPEAT_ORDER_PATTERN = /\b(repeat\s*order|last\s*order|same\s*order|order\s*again)\b/i;
const MEDICINE_AVAILABILITY_PATTERN =
  /\b(available|availability|in\s*stock|stock|price|cost|do\s*you\s*have|medicine)\b/i;
const STORE_PATTERN =
  /\b(location|address|timing|timings|hours|open|close|where|map|store|directions)\b/i;
const FAQ_PATTERN = /\b(faq|faqs|question|help\s*me|support)\b/i;
const PHARMACIST_PATTERN = /\b(pharmacist|talk|speak|human|agent)\b/i;

const BUTTON_INTENT_MAP: Record<string, Intent> = {
  [SERVICE_OPTION_IDS.UPLOAD_PRESCRIPTION]: Intent.UPLOAD_PRESCRIPTION,
  [SERVICE_OPTION_IDS.ORDER_STATUS]: Intent.ORDER_STATUS,
  [SERVICE_OPTION_IDS.REFILL_MEDICINE]: Intent.REFILL_MEDICINE,
  [SERVICE_OPTION_IDS.MEDICINE_AVAILABILITY]: Intent.MEDICINE_AVAILABILITY,
  [SERVICE_OPTION_IDS.REPEAT_ORDER]: Intent.REPEAT_ORDER,
  [SERVICE_OPTION_IDS.STORE_INFO]: Intent.STORE_INFO,
  [SERVICE_OPTION_IDS.FAQ_SUPPORT]: Intent.FAQ_SUPPORT,
  [SERVICE_OPTION_IDS.TALK_PHARMACIST]: Intent.TALK_PHARMACIST,
};

class RuleBasedIntentDetector implements IntentDetector {
  detect(message: string, buttonId?: string): IntentResult {
    if (buttonId && BUTTON_INTENT_MAP[buttonId]) {
      return { intent: BUTTON_INTENT_MAP[buttonId], confidence: 1 };
    }

    const normalized = message.trim();

    if (!normalized) {
      return { intent: Intent.GENERAL_MESSAGE, confidence: 0.5 };
    }

    if (GREETING_PATTERN.test(normalized)) {
      return { intent: Intent.GREETING, confidence: 1 };
    }

    if (MENU_PATTERN.test(normalized)) {
      return { intent: Intent.SERVICE_MENU, confidence: 1 };
    }

    if (UPLOAD_PATTERN.test(normalized)) {
      return { intent: Intent.UPLOAD_PRESCRIPTION, confidence: 0.9 };
    }

    if (ORDER_STATUS_PATTERN.test(normalized)) {
      return { intent: Intent.ORDER_STATUS, confidence: 0.9 };
    }

    if (REPEAT_ORDER_PATTERN.test(normalized)) {
      return { intent: Intent.REPEAT_ORDER, confidence: 0.9 };
    }

    if (REFILL_PATTERN.test(normalized)) {
      return { intent: Intent.REFILL_MEDICINE, confidence: 0.9 };
    }

    if (MEDICINE_AVAILABILITY_PATTERN.test(normalized)) {
      return { intent: Intent.MEDICINE_AVAILABILITY, confidence: 0.85 };
    }

    if (STORE_PATTERN.test(normalized)) {
      return { intent: Intent.STORE_INFO, confidence: 0.9 };
    }

    if (FAQ_PATTERN.test(normalized)) {
      return { intent: Intent.FAQ_SUPPORT, confidence: 0.85 };
    }

    if (PHARMACIST_PATTERN.test(normalized)) {
      return { intent: Intent.TALK_PHARMACIST, confidence: 0.85 };
    }

    return { intent: Intent.GENERAL_MESSAGE, confidence: 1 };
  }
}

const defaultDetector = new RuleBasedIntentDetector();

export const detectIntent = (message: string, buttonId?: string): IntentResult =>
  defaultDetector.detect(message, buttonId);
