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
}

export const pharmacyService = new PharmacyService();
