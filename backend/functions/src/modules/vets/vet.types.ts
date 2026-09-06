import { VetSearchType } from '../../config/constants';

export interface PlaceLocation {
  lat: number;
  lng: number;
}

export interface NormalizedPlace {
  id: string;
  name: string;
  address: string;
  location: PlaceLocation;
  rating: number | null;
  userRatingCount: number;
  isOpen: boolean | null;
  distanceMeters: number | null;
  types: string[];
  googleMapsUri: string;
  phoneNumber?: string;
}

export interface NearbyVetsQuery {
  lat: number;
  lng: number;
  radius?: number;
  type?: VetSearchType;
}

export interface NearbyVetsResponse {
  places: NormalizedPlace[];
  count: number;
  type: VetSearchType;
  radiusMeters: number;
}
