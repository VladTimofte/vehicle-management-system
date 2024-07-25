export interface Vehicle {
    id: string;
    plateNumber: string;
    make: string;
    model: string;
    manufactureYear: number;
    vinNumber: string;
    engineHorsePower: number;
    engineCapacityCC: number;
    fuelType: string;
    expirationDateITP: number;
    expirationDateRCA: number;
  }

  export enum FuelType {
    DIESEL = 'DIESEL',
    GASOLINE = 'GASOLINE',
    ELECTRIC = 'ELECTRIC',
    HYBRID = 'HYBRID',
    LPG = 'LPG',
    GASOLINE_LPG = 'GASOLINE AND LPG',
    HYDROGEN = 'HYDROGEN'
  }

  