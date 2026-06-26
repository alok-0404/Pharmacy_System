import { detectIntent, Intent } from './intent-detector';
import { SERVICE_OPTION_IDS } from './service-menu';

const MENU_BUTTON_IDS = new Set<string>(Object.values(SERVICE_OPTION_IDS));

/** Patient chose Talk to Pharmacist — bot stops auto-replies until MENU or pharmacist replies. */
export function shouldExitHandoff(message: string, buttonId?: string): boolean {
  if (buttonId && MENU_BUTTON_IDS.has(buttonId)) {
    return true;
  }

  const { intent } = detectIntent(message, buttonId);

  return intent === Intent.GREETING || intent === Intent.SERVICE_MENU;
}

export function formatHandoffAck(pharmacyName: string): string {
  return (
    `✓ Message received. A pharmacist at ${pharmacyName} will reply shortly.\n\n` +
    `Reply *MENU* to use bot services again.`
  );
}
