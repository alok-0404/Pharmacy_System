import { SERVICE_OPTION_IDS } from './service-menu';

export enum Intent {
  GREETING = 'GREETING',
  UPLOAD_PRESCRIPTION = 'UPLOAD_PRESCRIPTION',
  ORDER_STATUS = 'ORDER_STATUS',
  REFILL_MEDICINE = 'REFILL_MEDICINE',
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
const ORDER_STATUS_PATTERN = /\b(order\s*status|track\s*order|my\s*order|status)\b/i;
const REFILL_PATTERN = /\b(refill|reorder|medicine\s*again)\b/i;
const PHARMACIST_PATTERN = /\b(pharmacist|talk|speak|human|agent)\b/i;

const BUTTON_INTENT_MAP: Record<string, Intent> = {
  [SERVICE_OPTION_IDS.UPLOAD_PRESCRIPTION]: Intent.UPLOAD_PRESCRIPTION,
  [SERVICE_OPTION_IDS.ORDER_STATUS]: Intent.ORDER_STATUS,
  [SERVICE_OPTION_IDS.REFILL_MEDICINE]: Intent.REFILL_MEDICINE,
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

    if (REFILL_PATTERN.test(normalized)) {
      return { intent: Intent.REFILL_MEDICINE, confidence: 0.9 };
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
