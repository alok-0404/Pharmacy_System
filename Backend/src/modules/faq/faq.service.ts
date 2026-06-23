import { Faq, IFaq } from './faq.model';
import { ApiError } from '../../utils/ApiError';
import { HTTP_STATUS } from '../../config/constants';
import { isValidObjectId } from '../../utils/objectId';
import { handleMongooseError } from '../../utils/mongooseError';

export interface CreateFaqInput {
  question: string;
  answer: string;
  keywords?: string[];
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateFaqInput {
  question?: string;
  answer?: string;
  keywords?: string[];
  sortOrder?: number;
  isActive?: boolean;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2);
}

export class FaqService {
  async getFaqs(pharmacyId: string, activeOnly = false): Promise<IFaq[]> {
    if (!isValidObjectId(pharmacyId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid pharmacy ID');
    }

    const filter: Record<string, unknown> = { pharmacyId };

    if (activeOnly) {
      filter.isActive = true;
    }

    return Faq.find(filter).sort({ sortOrder: 1, createdAt: 1 });
  }

  async createFaq(pharmacyId: string, data: CreateFaqInput): Promise<IFaq> {
    if (!isValidObjectId(pharmacyId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid pharmacy ID');
    }

    try {
      return await Faq.create({
        pharmacyId,
        question: data.question.trim(),
        answer: data.answer.trim(),
        keywords: data.keywords?.map((k) => k.trim().toLowerCase()).filter(Boolean) ?? [],
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      });
    } catch (error) {
      return handleMongooseError(error);
    }
  }

  async updateFaq(pharmacyId: string, faqId: string, data: UpdateFaqInput): Promise<IFaq> {
    if (!isValidObjectId(faqId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid FAQ ID');
    }

    const faq = await Faq.findOne({ _id: faqId, pharmacyId });

    if (!faq) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'FAQ not found');
    }

    if (data.question !== undefined) faq.question = data.question.trim();
    if (data.answer !== undefined) faq.answer = data.answer.trim();
    if (data.keywords !== undefined) {
      faq.keywords = data.keywords.map((k) => k.trim().toLowerCase()).filter(Boolean);
    }
    if (data.sortOrder !== undefined) faq.sortOrder = data.sortOrder;
    if (data.isActive !== undefined) faq.isActive = data.isActive;

    try {
      await faq.save();
      return faq;
    } catch (error) {
      return handleMongooseError(error);
    }
  }

  async deleteFaq(pharmacyId: string, faqId: string): Promise<void> {
    if (!isValidObjectId(faqId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid FAQ ID');
    }

    const faq = await Faq.findOne({ _id: faqId, pharmacyId });

    if (!faq) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'FAQ not found');
    }

    await faq.softDelete();
  }

  async matchFaq(pharmacyId: string, message: string): Promise<IFaq | null> {
    const faqs = await this.getFaqs(pharmacyId, true);

    if (!faqs.length) {
      return null;
    }

    const normalized = message.toLowerCase().trim();
    const messageTokens = new Set(tokenize(message));

    let best: { faq: IFaq; score: number } | null = null;

    for (const faq of faqs) {
      let score = 0;

      if (normalized.includes(faq.question.toLowerCase())) {
        score += 10;
      }

      for (const keyword of faq.keywords) {
        if (keyword && normalized.includes(keyword)) {
          score += 5;
        }
      }

      for (const token of tokenize(faq.question)) {
        if (messageTokens.has(token)) {
          score += 1;
        }
      }

      if (!best || score > best.score) {
        best = { faq, score };
      }
    }

    return best && best.score >= 2 ? best.faq : null;
  }

  formatFaqList(faqs: IFaq[]): string {
    if (!faqs.length) {
      return 'No FAQs are configured yet. Please ask your question and a pharmacist will reply.';
    }

    const lines = faqs.map((faq, index) => `${index + 1}. ${faq.question}`);

    return `Here are common questions:\n\n${lines.join('\n')}\n\nAsk your question in your own words and we will try to answer.`;
  }
}

export const faqService = new FaqService();
