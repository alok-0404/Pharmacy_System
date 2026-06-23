import {
  SERVICE_MENU_BODY,
  SERVICE_MENU_BUTTON,
  SERVICE_MENU_ROWS,
} from '../../bot/service-menu';
import { MetaSendMessageResponse } from './whatsapp.types';

export interface SendInteractiveListParams {
  phoneNumberId: string;
  to: string;
  bodyText?: string;
  buttonLabel?: string;
}

export async function sendInteractiveListMessage(
  params: SendInteractiveListParams,
  sendRequest: (phoneNumberId: string, body: unknown) => Promise<MetaSendMessageResponse>,
): Promise<MetaSendMessageResponse> {
  return sendRequest(params.phoneNumberId, {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: params.to,
    type: 'interactive',
    interactive: {
      type: 'list',
      body: {
        text: params.bodyText ?? SERVICE_MENU_BODY,
      },
      action: {
        button: params.buttonLabel ?? SERVICE_MENU_BUTTON,
        sections: [
          {
            title: 'Pharmacy Services',
            rows: SERVICE_MENU_ROWS.map((row) => ({
              id: row.id,
              title: row.title,
              description: row.description,
            })),
          },
        ],
      },
    },
  });
}
