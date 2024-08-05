import { APP_CONFIG } from "@src/app/config/config";
import { HasId, IStorageService } from "@src/app/models/common";
import { FirebaseStorageService } from "./firebase.service";
import { LocalStorageService } from "./local-db.service";

export class StorageFactory {
    public static createStorage<T extends HasId>(): IStorageService<T> {
        switch (APP_CONFIG.storage) {
            case 'firebase':
                return new FirebaseStorageService<T>();
            case 'localstorage':
                return new LocalStorageService<T>();
            default:
                return new LocalStorageService<T>();
        }
    }
}
