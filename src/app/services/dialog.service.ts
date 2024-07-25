import { Injectable, ApplicationRef, EnvironmentInjector, ComponentRef, createComponent } from '@angular/core';
import { DialogComponent } from '../components/dialog/dialog.component';

@Injectable({ providedIn: 'root' })
export class DialogService {
  private isDialogOpen = false;

  constructor(
    private appRef: ApplicationRef,
    private environmentInjector: EnvironmentInjector
  ) {}

  openConfirmDialog(data: { title: string, message: string, type: string }): Promise<boolean> {
    if (this.isDialogOpen) {
      return Promise.resolve(false);
    }
    this.isDialogOpen = true;

    return new Promise<boolean>((resolve) => {
      const componentRef = this.createComponent(DialogComponent);
      componentRef.instance.title = data.title;
      componentRef.instance.message = data.message;
      componentRef.instance.type = data.type;

      componentRef.instance.isDialogConfirmed.subscribe((result: boolean) => {
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
