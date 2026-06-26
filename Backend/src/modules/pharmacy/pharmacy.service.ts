import { Pharmacy, IPharmacy } from './pharmacy.model';
import { ApiError } from '../../utils/ApiError';
import { HTTP_STATUS } from '../../config/constants';
import { isValidObjectId } from '../../utils/objectId';
import { handleMongooseError } from '../../utils/mongooseError';
import { saveBufferToUploads } from '../../utils/mediaStorage';

const MIME_EXTENSION: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const MAX_ASSET_BYTES = 5 * 1024 * 1024;

export interface CreatePharmacyInput {
  name: string;
  email: string;
  mobile: string;
  whatsappPhoneNumberId: string;
  businessAccountId: string;
  greetingImageUrl?: string;
  isActive?: boolean;
}

export interface UpdatePaymentSettingsInput {
  paymentLinkUrl?: string;
  paymentQrImageUrl?: string;
}

export interface UpdateStoreSettingsInput {
  storeAddress?: string;
  storeHours?: string;
  storeMapUrl?: string;
  storeLatitude?: number | null;
  storeLongitude?: number | null;
  greetingImageUrl?: string;
}

export type PharmacyAssetType = 'payment_qr' | 'greeting_image';

export interface UploadPharmacyAssetInput {
  type: PharmacyAssetType;
  mimeType: string;
  file: string;
}

export class PharmacyService {
  async createPharmacy(data: CreatePharmacyInput): Promise<IPharmacy> {
    try {
      const pharmacy = await Pharmacy.create(data);
      return pharmacy;
    } catch (error) {
      return handleMongooseError(error);
    }
  }

  async getPharmacyById(id: string): Promise<IPharmacy> {
    if (!isValidObjectId(id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid pharmacy ID');
    }

    const pharmacy = await Pharmacy.findById(id);

    if (!pharmacy) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Pharmacy not found');
    }

    return pharmacy;
  }

  async updatePaymentSettings(
    pharmacyId: string,
    data: UpdatePaymentSettingsInput,
  ): Promise<IPharmacy> {
    const pharmacy = await this.getPharmacyById(pharmacyId);

    if (data.paymentLinkUrl !== undefined) {
      pharmacy.paymentLinkUrl = data.paymentLinkUrl.trim() || undefined;
    }

    if (data.paymentQrImageUrl !== undefined) {
      pharmacy.paymentQrImageUrl = data.paymentQrImageUrl.trim() || undefined;
    }

    try {
      await pharmacy.save();
      return pharmacy;
    } catch (error) {
      return handleMongooseError(error);
    }
  }

  async updateStoreSettings(
    pharmacyId: string,
    data: UpdateStoreSettingsInput,
  ): Promise<IPharmacy> {
    const pharmacy = await this.getPharmacyById(pharmacyId);

    if (data.storeAddress !== undefined) {
      pharmacy.storeAddress = data.storeAddress.trim() || undefined;
    }

    if (data.storeHours !== undefined) {
      pharmacy.storeHours = data.storeHours.trim() || undefined;
    }

    if (data.storeMapUrl !== undefined) {
      pharmacy.storeMapUrl = data.storeMapUrl.trim() || undefined;
    }

    if (data.storeLatitude !== undefined) {
      pharmacy.storeLatitude = data.storeLatitude ?? undefined;
    }

    if (data.storeLongitude !== undefined) {
      pharmacy.storeLongitude = data.storeLongitude ?? undefined;
    }

    if (data.greetingImageUrl !== undefined) {
      pharmacy.greetingImageUrl = data.greetingImageUrl.trim() || undefined;
    }

    try {
      await pharmacy.save();
      return pharmacy;
    } catch (error) {
      return handleMongooseError(error);
    }
  }

  async uploadAsset(pharmacyId: string, data: UploadPharmacyAssetInput): Promise<IPharmacy> {
    const pharmacy = await this.getPharmacyById(pharmacyId);
    const extension = MIME_EXTENSION[data.mimeType];

    if (!extension) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Unsupported image type');
    }

    const base64 = data.file.includes(',') ? data.file.split(',')[1] : data.file;
    const buffer = Buffer.from(base64, 'base64');

    if (!buffer.length) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid file data');
    }

    if (buffer.length > MAX_ASSET_BYTES) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Image must be 5 MB or smaller');
    }

    const subdir =
      data.type === 'payment_qr'
        ? `payment-qr/${pharmacyId}`
        : `greeting/${pharmacyId}`;

    const url = await saveBufferToUploads(subdir, buffer, extension);

    if (data.type === 'payment_qr') {
      pharmacy.paymentQrImageUrl = url;
    } else {
      pharmacy.greetingImageUrl = url;
    }

    try {
      await pharmacy.save();
      return pharmacy;
    } catch (error) {
      return handleMongooseError(error);
    }
  }
}

export const pharmacyService = new PharmacyService();
