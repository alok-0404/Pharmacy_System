import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { Pharmacy } from '../pharmacy/pharmacy.model';
import { User, UserRole } from '../user/user.model';
import { ApiError } from '../../utils/ApiError';
import { HTTP_STATUS } from '../../config/constants';
import { handleMongooseError } from '../../utils/mongooseError';

export interface PharmacyRegisterInput {
  pharmacyName: string;
  ownerName: string;
  email: string;
  mobile: string;
  city: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  pharmacyId: string;
  pharmacyName: string;
  ownerName: string;
  email: string;
}

const hashPassword = (password: string): string => {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

const verifyPassword = (password: string, stored: string): boolean => {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;

  const hashBuffer = scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(hash, 'hex');

  if (hashBuffer.length !== storedBuffer.length) return false;

  return timingSafeEqual(hashBuffer, storedBuffer);
};

export class AuthService {
  async registerPharmacy(data: PharmacyRegisterInput): Promise<AuthResult> {
    const email = data.email.toLowerCase().trim();
    const ownerName = data.ownerName.trim();
    const pharmacyName = data.pharmacyName.trim();
    const mobile = data.mobile.trim();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        'An account with this email already exists. Please log in instead.',
      );
    }

    const existingPharmacy = await Pharmacy.findOne({ email }).setOptions({
      withDeleted: true,
    });

    if (existingPharmacy && !existingPharmacy.deletedAt) {
      return this.completeOrphanPharmacyRegistration(
        existingPharmacy,
        email,
        ownerName,
        pharmacyName,
        mobile,
        data.password,
      );
    }

    const suffix = `${Date.now().toString(36)}-${randomBytes(4).toString('hex')}`;

    try {
      const pharmacy = await Pharmacy.create({
        name: pharmacyName,
        email,
        mobile,
        whatsappPhoneNumberId: `pending-wa-${suffix}`,
        businessAccountId: `pending-biz-${suffix}`,
      });

      try {
        await User.create({
          pharmacyId: pharmacy._id,
          name: ownerName,
          email,
          password: hashPassword(data.password),
          role: UserRole.ADMIN,
        });
      } catch (userError) {
        await Pharmacy.findByIdAndDelete(pharmacy._id);
        return handleMongooseError(userError);
      }

      return {
        pharmacyId: String(pharmacy._id),
        pharmacyName: pharmacy.name,
        ownerName,
        email,
      };
    } catch (error) {
      return handleMongooseError(error);
    }
  }

  private async completeOrphanPharmacyRegistration(
    pharmacy: InstanceType<typeof Pharmacy>,
    email: string,
    ownerName: string,
    pharmacyName: string,
    mobile: string,
    password: string,
  ): Promise<AuthResult> {
    const userForPharmacy = await User.findOne({ pharmacyId: pharmacy._id, email });

    if (userForPharmacy) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        'An account with this email already exists. Please log in instead.',
      );
    }

    try {
      pharmacy.name = pharmacyName;
      pharmacy.mobile = mobile;
      await pharmacy.save();

      await User.create({
        pharmacyId: pharmacy._id,
        name: ownerName,
        email,
        password: hashPassword(password),
        role: UserRole.ADMIN,
      });

      return {
        pharmacyId: String(pharmacy._id),
        pharmacyName: pharmacy.name,
        ownerName,
        email,
      };
    } catch (error) {
      return handleMongooseError(error);
    }
  }

  async login(data: LoginInput): Promise<AuthResult> {
    const email = data.email.toLowerCase().trim();

    const user = await User.findOne({ email, isActive: true }).select('+password');

    if (!user) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        'Invalid email or password. If you registered earlier, complete registration with the same email or contact support.',
      );
    }

    if (!verifyPassword(data.password, user.password)) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
    }

    const pharmacy = await Pharmacy.findById(user.pharmacyId);

    if (!pharmacy || !pharmacy.isActive) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Pharmacy account is not active');
    }

    return {
      pharmacyId: String(pharmacy._id),
      pharmacyName: pharmacy.name,
      ownerName: user.name,
      email: user.email,
    };
  }
}

export const authService = new AuthService();
