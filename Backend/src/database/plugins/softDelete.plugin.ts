import { Schema, Query, UpdateQuery } from 'mongoose';

export interface ISoftDelete {
  deletedAt: Date | null;
}

export interface SoftDeleteMethods {
  softDelete(): Promise<this>;
  restore(): Promise<this>;
}

const excludeDeleted = function (this: Query<unknown, unknown>) {
  if (this.getOptions().withDeleted) {
    return;
  }
  this.where({ deletedAt: null });
};

export const softDeletePlugin = (schema: Schema): void => {
  schema.add({
    deletedAt: { type: Date, default: null, index: true },
  });

  schema.pre('find', excludeDeleted);
  schema.pre('findOne', excludeDeleted);
  schema.pre('findOneAndUpdate', excludeDeleted);
  schema.pre('countDocuments', excludeDeleted);

  schema.methods.softDelete = async function () {
    this.deletedAt = new Date();
    return this.save();
  };

  schema.methods.restore = async function () {
    this.deletedAt = null;
    return this.save();
  };

  schema.statics.softDeleteById = async function (id: string) {
    return this.findByIdAndUpdate(
      id,
      { deletedAt: new Date() } as UpdateQuery<unknown>,
      { new: true, withDeleted: true },
    );
  };
};
