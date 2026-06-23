/** WhatsApp interactive list row IDs — must match webhook button_reply / list_reply ids. */
export const SERVICE_OPTION_IDS = {
  UPLOAD_PRESCRIPTION: 'upload_prescription',
  ORDER_STATUS: 'order_status',
  REFILL_MEDICINE: 'refill_medicine',
  STORE_INFO: 'store_info',
  FAQ_SUPPORT: 'faq_support',
  TALK_PHARMACIST: 'talk_pharmacist',
} as const;

export type ServiceOptionId = (typeof SERVICE_OPTION_IDS)[keyof typeof SERVICE_OPTION_IDS];

export const SERVICE_MENU_BODY =
  'Please choose a service below. Tap *View Services* to see all options.';

export const SERVICE_MENU_BUTTON = 'View Services';

export const SERVICE_MENU_ROWS = [
  {
    id: SERVICE_OPTION_IDS.UPLOAD_PRESCRIPTION,
    title: 'Upload Prescription',
    description: 'Send prescription photo or PDF',
  },
  {
    id: SERVICE_OPTION_IDS.ORDER_STATUS,
    title: 'Order Status',
    description: 'Check your latest order',
  },
  {
    id: SERVICE_OPTION_IDS.REFILL_MEDICINE,
    title: 'Refill Medicine',
    description: 'Reorder your medicines',
  },
  {
    id: SERVICE_OPTION_IDS.STORE_INFO,
    title: 'Store Location',
    description: 'Address, hours & map',
  },
  {
    id: SERVICE_OPTION_IDS.FAQ_SUPPORT,
    title: 'FAQ Support',
    description: 'Common questions',
  },
  {
    id: SERVICE_OPTION_IDS.TALK_PHARMACIST,
    title: 'Talk to Pharmacist',
    description: 'Chat with our team',
  },
] as const;

export function getServiceOptionLabel(id: string): string {
  return SERVICE_MENU_ROWS.find((row) => row.id === id)?.title ?? id;
}
