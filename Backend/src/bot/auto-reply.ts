import { Intent } from './intent-detector';
import { getOrderStatusLabel } from '../modules/notification/order-notification.service';
import { OrderStatus } from '../config/order.constants';
import { hasStoreCoordinates, resolveStoreMapUrl } from './store-location';

export interface PharmacyContext {
  name: string;
  greetingImageUrl?: string;
  storeAddress?: string;
  storeHours?: string;
  storeMapUrl?: string;
  storeLatitude?: number;
  storeLongitude?: number;
}

export interface BotReply {
  text: string;
  imageUrl?: string;
  sendServiceMenu?: boolean;
}

export interface ReplyGenerator {
  generate(
    intent: Intent,
    context: PharmacyContext,
    orderStatus?: OrderStatus,
    faqText?: string,
  ): BotReply;
}

function formatStoreInfo(context: PharmacyContext): string {
  const lines = [`*${context.name}* store information:`];

  if (context.storeAddress) {
    lines.push(`\n📍 Address:\n${context.storeAddress}`);
  }

  if (context.storeHours) {
    lines.push(`\n🕐 Hours:\n${context.storeHours}`);
  }

  const mapUrl = resolveStoreMapUrl(context);
  if (mapUrl) {
    lines.push(`\n🗺️ Location on map:\n${mapUrl}`);
  }

  if (hasStoreCoordinates(context)) {
    lines.push(
      `\n📍 We are also sending a *location pin* — tap it in the next message for one-tap directions.`,
    );
  }

  if (lines.length === 1) {
    return `Store details for ${context.name} are not configured yet. Please contact our team for address and timings.`;
  }

  return lines.join('');
}

class TemplateReplyGenerator implements ReplyGenerator {
  generate(
    intent: Intent,
    context: PharmacyContext,
    orderStatus?: OrderStatus,
    faqText?: string,
  ): BotReply {
    if (faqText) {
      return { text: faqText };
    }

    switch (intent) {
      case Intent.GREETING:
        return {
          text: `Welcome to ${context.name}! 👋\nHow can we help you today?`,
          imageUrl: context.greetingImageUrl,
          sendServiceMenu: true,
        };

      case Intent.SERVICE_MENU:
        return {
          text: `Here are the services available at ${context.name}:`,
          sendServiceMenu: true,
        };

      case Intent.UPLOAD_PRESCRIPTION:
        return {
          text: `Please send your prescription as a *photo* or *PDF* document.\n\nOur team at ${context.name} will review it and confirm your order shortly.`,
        };

      case Intent.ORDER_STATUS:
        if (orderStatus) {
          return {
            text: `Your latest order status: *${getOrderStatusLabel(orderStatus)}*.\n\nWe will notify you on WhatsApp when it changes. — ${context.name}`,
          };
        }

        return {
          text: `We could not find an active order linked to your number.\n\nPlease upload a prescription to start a new order, or reply *MENU* to see other services.`,
          sendServiceMenu: true,
        };

      case Intent.REFILL_MEDICINE:
        return {
          text: `To refill your medicines at ${context.name}, please send your prescription photo/PDF or the medicine names you need.`,
        };

      case Intent.MEDICINE_AVAILABILITY:
        return {
          text: `Please type the *medicine name* you want to check (e.g. Paracetamol 500mg).\n\nWe will reply with stock and price from ${context.name}.`,
        };

      case Intent.REPEAT_ORDER:
        return {
          text: `Repeat order request received at ${context.name}.`,
        };

      case Intent.STORE_INFO:
        return { text: formatStoreInfo(context) };

      case Intent.FAQ_SUPPORT:
        return {
          text: 'Loading FAQs...',
        };

      case Intent.TALK_PHARMACIST:
        return {
          text: `A pharmacist at ${context.name} has been notified and will respond to you shortly.\n\nPlease share your question here.`,
        };

      default:
        return {
          text: `Your message has been received. A pharmacist at ${context.name} will respond shortly.\n\nReply *MENU* to see available services.`,
        };
    }
  }
}

const defaultGenerator = new TemplateReplyGenerator();

export const generateReply = (
  intent: Intent,
  context: PharmacyContext,
  orderStatus?: OrderStatus,
  faqText?: string,
  medicineText?: string,
  repeatOrderText?: string,
): BotReply => {
  if (repeatOrderText) {
    return { text: repeatOrderText };
  }

  if (medicineText) {
    return { text: medicineText };
  }

  return defaultGenerator.generate(intent, context, orderStatus, faqText);
};
