import { Component } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import { AppAuthButtonComponent } from "../../components/app-auth-button/app-auth-button.component";

@Component({
    selector: 'app-login',
    standalone: true,
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    imports: [MatCardModule, AppAuthButtonComponent]
})
export class LoginComponent {

}
