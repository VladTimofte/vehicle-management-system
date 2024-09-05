import { Observable } from 'rxjs';

export interface HasId {
  id: string;
}

export interface IStorageService<T> {
  getItems(): T[];
  removeItem(id: string): void;
  addOrUpdateItem(item: T): void;
  getItemsObservable(): Observable<T[]>;
  setKey(key: string): void;
}

export interface AppConfig {
  storage: string;
  OPEN_STREET_MAP: { LOCATION_API_URL: string };
  AUTH_SERVICE: { ROLES_API: string; DOMAIN: string; CLIENT_ID: string };
  NHTSA: { MAKES_API: string; MODELS_API: string };
  CLOUDINARY: { API_URL: string; UPLOAD_PRESET: string };
  EMAIL_JS: { SERVICE_ID: string; TEMPLATE_ID: string; PUBLIC_KEY: string };
  OPEN_ROUTE_SERVICE: { API_KEY: string; API_URL: string };
}
