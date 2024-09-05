import { AppConfig } from "../models/common";

export const APP_CONFIG: AppConfig = {
    storage: 'localstorage', // 'firebase', 'localstorage', 'custom'
    OPEN_STREET_MAP: {
        LOCATION_API_URL: "https://nominatim.openstreetmap.org/search"
    },
    AUTH_SERVICE: {
        ROLES_API: 'https://hevicle-management-sys-dev.com/roles',
        DOMAIN: 'dev-qemisnr832dfdbg6.us.auth0.com',
        CLIENT_ID: '5IRcm4DfPrZWdDx9hEPk1X9o98LSuo8g',
    },
    NHTSA: {
        MAKES_API: 'https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json',
        MODELS_API:'https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/'
    },
    CLOUDINARY: {
        API_URL: 'https://api.cloudinary.com/v1_1/digssbgxf/raw/upload',
        UPLOAD_PRESET: 'vehicle_management_system'
    },
    EMAIL_JS: {
        SERVICE_ID: 'service_tpa25u4',
        TEMPLATE_ID: 'template_njbew1g',
        PUBLIC_KEY: '8AGnXOW-H-n9Ufakl',
    },
    OPEN_ROUTE_SERVICE: {
        API_KEY: '5b3ce3597851110001cf6248295f210fe0614560a10c6efe63c0d005',
        API_URL: 'https://api.openrouteservice.org/v2/directions/driving-car'
    },
}
