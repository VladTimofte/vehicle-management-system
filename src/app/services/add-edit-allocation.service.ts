import { Injectable, ApplicationRef, EnvironmentInjector, ComponentRef, createComponent } from '@angular/core';
import { Allocation } from '../models/allocation.model';
import { AddEditAllocationModalComponent } from '../components/add-edit-allocation-modal/add-edit-allocation-modal.component';

@Injectable({ providedIn: 'root' })
export class AddEditAllocationFormService {
  private isDialogOpen = false;

  constructor(
    private appRef: ApplicationRef,
    private environmentInjector: EnvironmentInjector
  ) {}

  openAddEditAllocationForm(data: { allocation: Allocation, isAllocationUpdating: boolean }): Promise<boolean> {
    if (this.isDialogOpen) {
      return Promise.resolve(false);
    }
    this.isDialogOpen = true;

    return new Promise<boolean>((resolve) => {
      const componentRef = this.createComponent(AddEditAllocationModalComponent);
      componentRef.instance.allocation = data.allocation;
      componentRef.instance.isAllocationUpdating = data.isAllocationUpdating;

      componentRef.instance.isAddEditAllocationConfirmed.subscribe((result: boolean) => {
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
