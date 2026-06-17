import { Intent } from './intent-detector';

export interface PharmacyContext {
  name: string;
  greetingImageUrl?: string;
}

export interface BotReply {
  text: string;
  imageUrl?: string;
}

export interface ReplyGenerator {
  generate(intent: Intent, context: PharmacyContext): BotReply;
}

class TemplateReplyGenerator implements ReplyGenerator {
  generate(intent: Intent, context: PharmacyContext): BotReply {
    if (intent === Intent.GREETING) {
      return {
        text: `Welcome to ${context.name}. How can we help you today?`,
        imageUrl: context.greetingImageUrl,
      };
    }

    return {
      text: `Your message has been received. A pharmacist at ${context.name} will respond shortly.`,
    };
  }
}

const defaultGenerator = new TemplateReplyGenerator();

export const generateReply = (intent: Intent, context: PharmacyContext): BotReply =>
  defaultGenerator.generate(intent, context);
