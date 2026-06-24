import { Medicine, IMedicine } from './medicine.model';
import { ApiError } from '../../utils/ApiError';
import { HTTP_STATUS } from '../../config/constants';
import { isValidObjectId } from '../../utils/objectId';
import { handleMongooseError } from '../../utils/mongooseError';

export interface CreateMedicineInput {
  name: string;
  unit?: string;
  price: number;
  stockQuantity: number;
  isActive?: boolean;
}

export interface UpdateMedicineInput {
  name?: string;
  unit?: string;
  price?: number;
  stockQuantity?: number;
  isActive?: boolean;
}

export class MedicineService {
  async getMedicines(pharmacyId: string): Promise<IMedicine[]> {
    if (!isValidObjectId(pharmacyId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid pharmacy ID');
    }

    return Medicine.find({ pharmacyId }).sort({ name: 1 });
  }

  async createMedicine(pharmacyId: string, data: CreateMedicineInput): Promise<IMedicine> {
    if (!isValidObjectId(pharmacyId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid pharmacy ID');
    }

    try {
      return await Medicine.create({
        pharmacyId,
        name: data.name.trim(),
        unit: data.unit?.trim() || 'strip',
        price: data.price,
        stockQuantity: data.stockQuantity,
        isActive: data.isActive ?? true,
      });
    } catch (error) {
      return handleMongooseError(error);
    }
  }

  async updateMedicine(
    pharmacyId: string,
    medicineId: string,
    data: UpdateMedicineInput,
  ): Promise<IMedicine> {
    if (!isValidObjectId(medicineId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid medicine ID');
    }

    const medicine = await Medicine.findOne({ _id: medicineId, pharmacyId });

    if (!medicine) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Medicine not found');
    }

    if (data.name !== undefined) medicine.name = data.name.trim();
    if (data.unit !== undefined) medicine.unit = data.unit.trim();
    if (data.price !== undefined) medicine.price = data.price;
    if (data.stockQuantity !== undefined) medicine.stockQuantity = data.stockQuantity;
    if (data.isActive !== undefined) medicine.isActive = data.isActive;

    try {
      await medicine.save();
      return medicine;
    } catch (error) {
      return handleMongooseError(error);
    }
  }

  async deleteMedicine(pharmacyId: string, medicineId: string): Promise<void> {
    if (!isValidObjectId(medicineId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid medicine ID');
    }

    const medicine = await Medicine.findOne({ _id: medicineId, pharmacyId });

    if (!medicine) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Medicine not found');
    }

    await medicine.softDelete();
  }

  async findAvailability(pharmacyId: string, query: string): Promise<IMedicine | null> {
    const medicines = await Medicine.find({ pharmacyId, isActive: true });
    const normalized = query.toLowerCase().trim();

    if (!normalized) {
      return null;
    }

    let best: { medicine: IMedicine; score: number } | null = null;

    for (const medicine of medicines) {
      const name = medicine.name.toLowerCase();
      let score = 0;

      if (normalized.includes(name) || name.includes(normalized)) {
        score += 10;
      }

      for (const token of normalized.split(/\s+/)) {
        if (token.length > 2 && name.includes(token)) {
          score += 3;
        }
      }

      if (!best || score > best.score) {
        best = { medicine, score };
      }
    }

    return best && best.score >= 3 ? best.medicine : null;
  }

  formatAvailabilityReply(medicine: IMedicine, pharmacyName: string): string {
    if (medicine.stockQuantity <= 0) {
      return `Sorry, *${medicine.name}* is currently out of stock at ${pharmacyName}.`;
    }

    return `*${medicine.name}* is available at ${pharmacyName}.\nPrice: ₹${medicine.price} per ${medicine.unit}\nStock: ${medicine.stockQuantity} ${medicine.unit}(s)`;
  }
}

export const medicineService = new MedicineService();
