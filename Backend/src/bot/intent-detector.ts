export enum Intent {
  GREETING = 'GREETING',
  GENERAL_MESSAGE = 'GENERAL_MESSAGE',
}

export interface IntentResult {
  intent: Intent;
  confidence: number;
}

export interface IntentDetector {
  detect(message: string): IntentResult;
}

const GREETING_PATTERN = /\b(hi|hello|hey)\b/i;

class RuleBasedIntentDetector implements IntentDetector {
  detect(message: string): IntentResult {
    const normalized = message.trim();

    if (GREETING_PATTERN.test(normalized)) {
      return { intent: Intent.GREETING, confidence: 1 };
    }

    return { intent: Intent.GENERAL_MESSAGE, confidence: 1 };
  }
}

const defaultDetector = new RuleBasedIntentDetector();

export const detectIntent = (message: string): IntentResult =>
  defaultDetector.detect(message);
