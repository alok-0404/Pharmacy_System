import QRCode from 'qrcode';
import { IOrder } from '../order/order.model';
import { IPharmacy } from '../pharmacy/pharmacy.model';
import { IPatient } from '../patient/patient.model';
import { whatsappService } from '../whatsapp/whatsapp.service';
import { Message, MessageStatus, MessageType, SenderType } from '../message/message.model';
import { Conversation } from '../conversation/conversation.model';
import { resolvePublicUrl } from '../../utils/publicUrl';
import { saveBufferToUploads } from '../../utils/mediaStorage';
import { logger } from '../../utils/logger';

export interface PaymentDetailsInput {
  paymentLinkUrl?: string;
  paymentQrImageUrl?: string;
  sendMode?: 'link' | 'qr' | 'both';
}

function orderShortId(orderId: string): string {
  return orderId.slice(-6).toUpperCase();
}

async function generateQrFromLink(link: string, pharmacyId: string): Promise<string> {
  const buffer = await QRCode.toBuffer(link, { type: 'png', width: 512, margin: 2 });
  return saveBufferToUploads(`payment-qr/${pharmacyId}`, buffer, '.png');
}

export class PaymentNotificationService {
  resolvePaymentLink(order: IOrder, pharmacy: IPharmacy, input?: PaymentDetailsInput): string | undefined {
    return input?.paymentLinkUrl ?? order.paymentLinkUrl ?? pharmacy.paymentLinkUrl ?? undefined;
  }

  resolveQrImageUrl(
    order: IOrder,
    pharmacy: IPharmacy,
    input?: PaymentDetailsInput,
  ): string | undefined {
    const explicit = input?.paymentQrImageUrl ?? order.paymentQrImageUrl ?? pharmacy.paymentQrImageUrl;
    return explicit ?? undefined;
  }

  private async saveBotMessage(
    order: IOrder,
    content: string,
    messageType: MessageType,
    whatsappMessageId?: string,
  ): Promise<void> {
    if (!order.conversationId) {
      return;
    }

    await Message.create({
      pharmacyId: order.pharmacyId,
      conversationId: order.conversationId,
      patientId: order.patientId,
      senderType: SenderType.BOT,
      content,
      messageType,
      whatsappMessageId,
      status: MessageStatus.SENT,
    });

    await Conversation.findByIdAndUpdate(order.conversationId, {
      lastMessageAt: new Date(),
    });
  }

  async sendPaymentDetails(
    order: IOrder,
    pharmacy: IPharmacy,
    patient: IPatient,
    input?: PaymentDetailsInput,
  ): Promise<IOrder> {
    const pharmacyId = String(order.pharmacyId);
    const shortId = orderShortId(String(order._id));
    const amount = order.paymentAmount;

    let paymentLink = this.resolvePaymentLink(order, pharmacy, input);
    let qrImageUrl = this.resolveQrImageUrl(order, pharmacy, input);

    if (input?.paymentLinkUrl) {
      order.paymentLinkUrl = input.paymentLinkUrl;
      paymentLink = input.paymentLinkUrl;
    }

    if (input?.paymentQrImageUrl) {
      order.paymentQrImageUrl = input.paymentQrImageUrl;
      qrImageUrl = input.paymentQrImageUrl;
    }

    if (!paymentLink && !qrImageUrl) {
      logger.warn('Payment details missing for order', { orderId: order._id });
      return order;
    }

    const sendMode = input?.sendMode ?? 'both';
    const shouldSendLink = sendMode === 'link' || sendMode === 'both';
    const shouldSendQr = sendMode === 'qr' || sendMode === 'both';

    try {
      if (shouldSendLink && paymentLink) {
        const linkMessage = `Payment link for order #${shortId}${
          amount ? ` (₹${amount})` : ''
        }:\n${resolvePublicUrl(paymentLink)}\n\nComplete payment and we will confirm your order. — ${pharmacy.name}`;

        const linkResult = await whatsappService.sendMessageForPharmacy(
          pharmacyId,
          patient.mobile,
          linkMessage,
        );

        await this.saveBotMessage(
          order,
          linkMessage,
          MessageType.TEXT,
          linkResult.messages?.[0]?.id,
        );
      }

      if (!qrImageUrl && paymentLink && shouldSendQr) {
        qrImageUrl = await generateQrFromLink(paymentLink, pharmacyId);
        order.paymentQrImageUrl = qrImageUrl;
      }

      if (shouldSendQr && qrImageUrl) {
        const caption = `Scan this QR code to pay${
          amount ? ` ₹${amount}` : ''
        } for order #${shortId}. — ${pharmacy.name}`;

        const imageResult = await whatsappService.sendImageMessageForPharmacy(
          pharmacyId,
          patient.mobile,
          resolvePublicUrl(qrImageUrl),
          caption,
        );

        await this.saveBotMessage(
          order,
          resolvePublicUrl(qrImageUrl),
          MessageType.IMAGE,
          imageResult.messages?.[0]?.id,
        );
      }

      order.paymentDetailsSentAt = new Date();
      await order.save();

      logger.info('Payment details sent via WhatsApp', {
        orderId: order._id,
        hasLink: Boolean(paymentLink),
        hasQr: Boolean(qrImageUrl),
      });
    } catch (error) {
      logger.error('Failed to send payment details', { orderId: order._id, error });
      throw error;
    }

    return order;
  }
}

export const paymentNotificationService = new PaymentNotificationService();
