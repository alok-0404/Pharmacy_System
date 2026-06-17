export interface MetaWebhookPayload {
  object: string;
  entry?: MetaWebhookEntry[];
}

export interface MetaWebhookEntry {
  id: string;
  changes: MetaWebhookChange[];
}

export interface MetaWebhookChange {
  field: string;
  value: MetaWebhookValue;
}

export interface MetaWebhookValue {
  messaging_product: string;
  metadata: {
    display_phone_number: string;
    phone_number_id: string;
  };
  contacts?: Array<{
    profile: { name: string };
    wa_id: string;
  }>;
  messages?: MetaIncomingMessage[];
}

export interface MetaIncomingMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
}

export interface ParsedIncomingMessage {
  phoneNumberId: string;
  senderMobile: string;
  senderName?: string;
  messageText: string;
  messageId: string;
}

export interface SendMessageParams {
  phoneNumberId: string;
  to: string;
  message: string;
}

export interface SendImageParams {
  phoneNumberId: string;
  to: string;
  imageUrl: string;
  caption?: string;
}

export interface MetaSendMessageResponse {
  messaging_product: string;
  contacts: Array<{ input: string; wa_id: string }>;
  messages: Array<{ id: string }>;
}
