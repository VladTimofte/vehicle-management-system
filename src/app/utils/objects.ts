import { Allocation } from '../models/allocation.model';
import { Employee } from '../models/employee.model';
import { Vehicle } from '../models/vehicle.model';
import { documentExpired } from './booleans';

export function constructExpiredDocsDialogData(
  employees: Employee[],
  fleets: Vehicle[],
  allocation: Allocation
) {
  const employee = employees.find((el) => el.id === allocation.employeeId);
  const fleet = fleets.find((el) => el.id === allocation.vehicleId);

  var data = {
    areDocsExpired: false,
    expiredDocs: [''],
    message: 'Expired Documents: ',
    title: '',
  };

  if (
    employee?.drivingLicenseExDate !== undefined &&
    documentExpired(employee?.drivingLicenseExDate)
  ) {
    data.areDocsExpired = true;
    data.expiredDocs.push('Expired Driving License');
  }
  if (
    fleet?.expirationDateRCA !== undefined &&
    documentExpired(fleet?.expirationDateRCA)
  ) {
    data.areDocsExpired = true;
    data.expiredDocs.push(' Expired Vehicle RCA');
  }
  if (
    fleet?.expirationDateITP !== undefined &&
    documentExpired(fleet?.expirationDateITP)
  ) {
    data.areDocsExpired = true;
    data.expiredDocs.push('Expired Vehicle ITP');
  }

  if (data.areDocsExpired) {
    for (let i = 0; i < data.expiredDocs.length; i++) {
      if (i === data.expiredDocs.length - 1) {
        data.message = data.message + data.expiredDocs[i];
      } else if (i !== 0) {
        data.message = data.message + data.expiredDocs[i] + ', ';
      }
    }
    data.title =
      'Cannot assign ' +
      employee?.firstName +
      ' ' +
      employee?.lastName +
      ' to ' +
      fleet?.plateNumber;
  }

  return data || {};
}
