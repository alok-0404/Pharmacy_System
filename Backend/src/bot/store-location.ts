import type { PharmacyContext } from './auto-reply';

export interface StoreLocationPin {
  latitude: number;
  longitude: number;
  name: string;
  address?: string;
}

export function hasStoreCoordinates(context: PharmacyContext): boolean {
  const { storeLatitude: lat, storeLongitude: lng } = context;

  return (
    typeof lat === 'number' &&
    !Number.isNaN(lat) &&
    lat >= -90 &&
    lat <= 90 &&
    typeof lng === 'number' &&
    !Number.isNaN(lng) &&
    lng >= -180 &&
    lng <= 180
  );
}

export function buildStoreLocationPin(context: PharmacyContext): StoreLocationPin | undefined {
  if (!hasStoreCoordinates(context)) {
    return undefined;
  }

  return {
    latitude: context.storeLatitude!,
    longitude: context.storeLongitude!,
    name: context.name,
    address: context.storeAddress,
  };
}
