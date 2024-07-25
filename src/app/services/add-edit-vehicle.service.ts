import { Injectable, ApplicationRef, EnvironmentInjector, ComponentRef, createComponent } from '@angular/core';
import { Vehicle } from '../models/vehicle.model';
import { AddEditVehicleModalComponent } from '../components/add-edit-vehicle-modal/add-edit-vehicle-modal.component';

@Injectable({ providedIn: 'root' })
export class AddEditVehicleFormService {
  private isDialogOpen = false;

  constructor(
    private appRef: ApplicationRef,
    private environmentInjector: EnvironmentInjector
  ) {}

  openAddEditFleetForm(data: { vehicle: Vehicle, isFleetUpdating: boolean }): Promise<boolean> {
    if (this.isDialogOpen) {
      return Promise.resolve(false);
    }
    this.isDialogOpen = true;

    return new Promise<boolean>((resolve) => {
      const componentRef = this.createComponent(AddEditVehicleModalComponent);
      componentRef.instance.vehicle = data.vehicle;
      componentRef.instance.isFleetUpdating = data.isFleetUpdating;

      componentRef.instance.isAddEditFleetConfirmed.subscribe((result: boolean) => {
        this.isDialogOpen = false;
        resolve(result);
        this.destroyComponent(componentRef);
      });

      document.body.appendChild(componentRef.location.nativeElement);
    });
  }

  private createComponent<T>(component: { new (...args: any[]): T }): ComponentRef<T> {
    const componentRef = createComponent(component, { environmentInjector: this.environmentInjector });
    this.appRef.attachView(componentRef.hostView);
    return componentRef;
  }

  private destroyComponent<T>(componentRef: ComponentRef<T>) {
    this.appRef.detachView(componentRef.hostView);
    componentRef.destroy();
  }
}
