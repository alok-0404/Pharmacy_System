import { Schema, model, Document, Types } from 'mongoose';
import {
  ISoftDelete,
  SoftDeleteMethods,
  softDeletePlugin,
} from '../../database/plugins/softDelete.plugin';
import { ITimestamps } from '../../types/common.types';

export enum UserRole {
  ADMIN = 'admin',
  PHARMACIST = 'pharmacist',
  STAFF = 'staff',
}

export interface IUser extends Document, ISoftDelete, ITimestamps, SoftDeleteMethods {
  pharmacyId: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
}

const userSchema = new Schema<IUser>(
  {
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
      default: UserRole.STAFF,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

userSchema.plugin(softDeletePlugin);

userSchema.index(
  { pharmacyId: 1, email: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } },
);
userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } },
);
userSchema.index({ pharmacyId: 1, isActive: 1 });
userSchema.index({ pharmacyId: 1, role: 1 });

export const User = model<IUser>('User', userSchema);
