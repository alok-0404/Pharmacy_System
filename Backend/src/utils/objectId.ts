import mongoose from 'mongoose';

export const isValidObjectId = (id: string): boolean =>
  mongoose.Types.ObjectId.isValid(id) &&
  String(new mongoose.Types.ObjectId(id)) === id;
