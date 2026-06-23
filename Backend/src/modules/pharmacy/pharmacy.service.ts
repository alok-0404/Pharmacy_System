import { Pharmacy, IPharmacy } from './pharmacy.model';
import { ApiError } from '../../utils/ApiError';
import { HTTP_STATUS } from '../../config/constants';
import { isValidObjectId } from '../../utils/objectId';
import { handleMongooseError } from '../../utils/mongooseError';

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

    try {
      await pharmacy.save();
      return pharmacy;
    } catch (error) {
      return handleMongooseError(error);
    }
  }
}

export const pharmacyService = new PharmacyService();
