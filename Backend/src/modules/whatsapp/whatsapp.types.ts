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
  image?: { id: string; mime_type?: string; caption?: string };
  document?: { id: string; mime_type?: string; filename?: string; caption?: string };
  interactive?: {
    type: 'button_reply' | 'list_reply';
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string; description?: string };
  };
}

export type IncomingMessageType = 'text' | 'image' | 'document' | 'interactive';

export interface ParsedIncomingMessage {
  phoneNumberId: string;
  senderMobile: string;
  senderName?: string;
  messageId: string;
  messageType: IncomingMessageType;
  messageText: string;
  buttonId?: string;
  mediaId?: string;
  mimeType?: string;
  fileName?: string;
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

export interface MetaMediaInfoResponse {
  url: string;
  mime_type: string;
  file_size?: number;
}
