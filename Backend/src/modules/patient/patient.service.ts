import { Patient, IPatient } from './patient.model';
import { Pharmacy } from '../pharmacy/pharmacy.model';
import { ApiError } from '../../utils/ApiError';
import { HTTP_STATUS } from '../../config/constants';
import { isValidObjectId } from '../../utils/objectId';
import { handleMongooseError } from '../../utils/mongooseError';

export interface CreatePatientInput {
  name: string;
  mobile: string;
  email?: string;
  isActive?: boolean;
}

export class PatientService {
  private async assertPharmacyExists(pharmacyId: string): Promise<void> {
    if (!isValidObjectId(pharmacyId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid pharmacy ID');
    }

    const pharmacy = await Pharmacy.findById(pharmacyId);

    if (!pharmacy) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Pharmacy not found');
    }
  }

  async createPatient(pharmacyId: string, data: CreatePatientInput): Promise<IPatient> {
    await this.assertPharmacyExists(pharmacyId);

    try {
      const patient = await Patient.create({
        ...data,
        pharmacyId,
      });
      return patient;
    } catch (error) {
      return handleMongooseError(error);
    }
  }

  async getPatients(pharmacyId: string): Promise<IPatient[]> {
    if (!isValidObjectId(pharmacyId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid pharmacy ID');
    }

    return Patient.find({ pharmacyId }).sort({ createdAt: -1 });
  }
}

export const patientService = new PatientService();
