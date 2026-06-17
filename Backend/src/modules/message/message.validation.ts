import { z } from 'zod';

export const createMessageSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID is required'),
  senderType: z.enum(['patient', 'pharmacist', 'bot']),
  content: z.string().min(1, 'Content is required'),
  messageType: z.enum(['text', 'image', 'document']).optional(),
  whatsappMessageId: z.string().optional(),
});

export const getMessagesQuerySchema = z.object({
  conversationId: z.string().optional(),
});
