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

/** Best map link for patients: saved URL → coords → address search on Google Maps. */
export function resolveStoreMapUrl(context: PharmacyContext): string | undefined {
  const saved = context.storeMapUrl?.trim();
  if (saved) {
    return saved;
  }

  if (hasStoreCoordinates(context)) {
    return `https://www.google.com/maps?q=${context.storeLatitude},${context.storeLongitude}`;
  }

  const address = context.storeAddress?.trim();
  if (address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }

  return undefined;
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
