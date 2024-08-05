import { Injectable, ApplicationRef, EnvironmentInjector, ComponentRef, createComponent } from '@angular/core';
import { Employee } from '../models/employee.model';
import { AddEditEmployeeModalComponent } from '../components/add-edit-employee-modal/add-edit-employee-modal.component';

@Injectable({ providedIn: 'root' })
export class AddEditEmployeeFormService {
  private isDialogOpen = false;

  constructor(
    private appRef: ApplicationRef,
    private environmentInjector: EnvironmentInjector
  ) {}

  openAddEditEmployeeForm(data: { employee: Employee, isEmployeeUpdating: boolean }): Promise<boolean> {
    if (this.isDialogOpen) {
      return Promise.resolve(false);
    }
    this.isDialogOpen = true;

    return new Promise<boolean>((resolve) => {
      const componentRef = this.createComponent(AddEditEmployeeModalComponent);
      componentRef.instance.employee = data.employee;
      componentRef.instance.isEmployeeUpdating = data.isEmployeeUpdating;

      componentRef.instance.isAddEditEmployeeConfirmed.subscribe((result: boolean) => {
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
