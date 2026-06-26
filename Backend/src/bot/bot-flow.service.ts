import { detectIntent, Intent, IntentResult } from './intent-detector';
import { generateReply, PharmacyContext } from './auto-reply';
import { SERVICE_OPTION_IDS } from './service-menu';
import { orderService } from '../modules/order/order.service';
import { faqService } from '../modules/faq/faq.service';
import { medicineService } from '../modules/medicine/medicine.service';
import { logger } from '../utils/logger';
import { buildStoreLocationPin, type StoreLocationPin } from './store-location';



export interface BotFlowInput {

  message: string;

  buttonId?: string;

  pharmacyId: string;

  patientId: string;

  context: PharmacyContext;

}



export interface BotFlowResponse {

  intent: Intent;

  reply: string;

  confidence: number;

  imageUrl?: string;

  sendServiceMenu: boolean;

  storeLocation?: StoreLocationPin;

}



export class BotFlowService {

  async process(input: BotFlowInput): Promise<BotFlowResponse> {

    const { intent, confidence }: IntentResult = detectIntent(input.message, input.buttonId);



    let orderStatus;

    let faqText: string | undefined;

    let medicineText: string | undefined;

    let repeatOrderText: string | undefined;



    if (intent === Intent.ORDER_STATUS) {

      const latestOrder = await orderService.getLatestOrderForPatient(

        input.pharmacyId,

        input.patientId,

      );

      orderStatus = latestOrder?.status;

    }



    if (intent === Intent.REPEAT_ORDER) {

      const repeatOrder = await orderService.createRepeatOrder(

        input.pharmacyId,

        input.patientId,

      );



      if (repeatOrder) {

        repeatOrderText = `Your repeat order has been placed at ${input.context.name}.\nOrder reference: *${repeatOrder._id}*\n\nWe will process it using your previous prescription and notify you on WhatsApp.`;

      } else {

        repeatOrderText = `We could not find a previous order to repeat.\n\nPlease upload a prescription or reply *MENU* to see other services.`;

      }

    }



    if (intent === Intent.FAQ_SUPPORT) {

      const faqs = await faqService.getFaqs(input.pharmacyId, true);

      faqText = faqService.formatFaqList(faqs);

    }



    if (intent === Intent.MEDICINE_AVAILABILITY && input.message.trim().length > 2) {

      const medicine = await medicineService.findAvailability(

        input.pharmacyId,

        input.message,

      );



      if (medicine) {

        medicineText = medicineService.formatAvailabilityReply(medicine, input.context.name);

      } else if (input.buttonId !== SERVICE_OPTION_IDS.MEDICINE_AVAILABILITY) {

        medicineText = `Sorry, we could not find *${input.message.trim()}* in our catalog at ${input.context.name}.\n\nReply *MENU* or type another medicine name.`;

      }

    }



    if (intent === Intent.GENERAL_MESSAGE) {

      const matched = await faqService.matchFaq(input.pharmacyId, input.message);



      if (matched) {

        faqText = `*${matched.question}*\n\n${matched.answer}`;

      } else {

        const medicine = await medicineService.findAvailability(

          input.pharmacyId,

          input.message,

        );



        if (medicine) {

          medicineText = medicineService.formatAvailabilityReply(medicine, input.context.name);

        }

      }

    }



    const { text, imageUrl, sendServiceMenu } = generateReply(

      intent,

      input.context,

      orderStatus,

      faqText,

      medicineText,

      repeatOrderText,

    );



    logger.info('Bot flow processed message', {

      intent,

      confidence,

      buttonId: input.buttonId,

      pharmacyName: input.context.name,

      faqMatched: Boolean(faqText && intent === Intent.GENERAL_MESSAGE),

      medicineMatched: Boolean(medicineText),

      repeatOrder: Boolean(repeatOrderText),

    });



    return {

      intent,

      reply: text,

      confidence,

      imageUrl,

      sendServiceMenu: Boolean(sendServiceMenu) && !repeatOrderText,

      storeLocation:
        intent === Intent.STORE_INFO ? buildStoreLocationPin(input.context) : undefined,

    };

  }

}



export const botFlowService = new BotFlowService();

