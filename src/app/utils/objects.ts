import { DateTime } from 'luxon'

import { Allocation } from '../models/allocation.model';
import { Employee } from '../models/employee.model';
import { Vehicle } from '../models/vehicle.model';
import { documentExpired } from './booleans';
import { formatActionString, formatEntityString } from './strings';
import { History } from '../models/history.model';

export function constructExpiredDocsDialogData(
  employees: Employee[],
  vehicles: Vehicle[],
  allocation: Allocation
) {
  const employee = employees.find((el) => el.id === allocation.employeeId);
  const vehicle = vehicles.find((el) => el.id === allocation.vehicleId);

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
    vehicle?.expirationDateRCA !== undefined &&
    documentExpired(vehicle?.expirationDateRCA)
  ) {
    data.areDocsExpired = true;
    data.expiredDocs.push(' Expired Vehicle RCA');
  }
  if (
    vehicle?.expirationDateITP !== undefined &&
    documentExpired(vehicle?.expirationDateITP)
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
      vehicle?.plateNumber;
  }

  return data || {};
}

export function refactorVehicles(data: Vehicle[]) {
  return data.map(el => {
    return {
      'Plate Number': el.plateNumber || '-',
      'Make': el.make || '-',
      'Model': el.model || '-',
      'Manufacture Year': el.manufactureYear || '-',
      'VIN Number': el.vinNumber || '-',
      'Engine HP': el.engineHorsePower || '-',
      'Engine Capacity': el.engineCapacityCC || '-',
      'Fuel Type': el.fuelType || '-',
      'ITP exp. Date': DateTime.fromMillis(el.expirationDateITP).toFormat('dd-MM-yyyy') || '-',
      'RCA exp Date': DateTime.fromMillis(el.expirationDateRCA).toFormat('dd-MM-yyyy') || '-'
    }
  })
}

export function refactorEmployees(data: Employee[]) {
  return data.map(el => {
    return {
      'First Name': el.firstName || '-',
      'Last Name': el.lastName || '-',
      'CNP': el.cnp || '-',
      'Driving License exp. Date': DateTime.fromMillis(el.drivingLicenseExDate).toFormat('dd-MM-yyyy') || '-',
      'Driving Categories': el.drivingLicenseCategories.join(',') || '-',
      'Email': el.email || '-',
      'Phone': el.phone || '-',
      'Job Department': el.jobDepartment || '-',
      'Emergency Contact Name': el.emergencyContactName || '-',
      'Emergency Contact Phone Number': el.emergencyContactPhoneNumber || '-'
    }
  })
}

export function refactorAllocations(data: Allocation[], employees: Employee[], vehicles: Vehicle[]) {
  return data.map(el => {
    return {
      'Employee': employees.find(element => element.id === el.employeeId)?.firstName || 'Deleted Employee',
      'Vehicle': vehicles.find(element => element.id === el.vehicleId)?.plateNumber || 'Deleted Vehicle',
      'Start Date': DateTime.fromMillis(el.startDate).toFormat('dd-MM-yyyy') || '-',
      'End Date': DateTime.fromMillis(el.endDate).toFormat('dd-MM-yyyy') || '-',
      'Start Location': el.startLocation.display_name || '-',
      'End Location': el.endLocation.display_name || '-',
      'Distance': el.distance.toFixed(2)|| '-'
    }
  })
}

export function  refactorHistory(data: History[]) {
  return data.map(el => {
    return {
      'User': el.user || '-',
      'Action': formatActionString(el.action) || '-',
      'Entity': formatEntityString(el.entity) || '-',
      'Resource': el.resource || '-',
      'Date': DateTime.fromMillis(el.date).toFormat('dd-MM-yyyy') || '-',
    }
  })
}
