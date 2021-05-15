import { Component, OnInit } from '@angular/core';
import { AuthService, AuthResponseData } from './auth.service'; 
import { Router } from '@angular/router'; 
import { FormControl} from '@angular/forms'; //Imported to track the value and validation status of an individual form control.
import { LoadingController, AlertController } from '@ionic/angular'; 
import { Validators, FormBuilder, FormGroup } from '@angular/forms'; 
import { PasswordStrengthValidator } from './password';
import { Observable } from 'rxjs';
import { VariableManagementService, Devices } from '../Services/variable-management.service';
import { MqttInterfaceService } from '../Services/mqtt-interface.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { IonicStorageService } from '../Services/ionic-storage.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  formgroup: FormGroup;
  
  isLoading = false; //set to false as a default.
  isLogin = true; //set to true as a default.
  //Parameters injected to trigger the necessary methods.
  constructor(private authService: AuthService, private mqttService: MqttInterfaceService, private router : Router, private loadingCtrl: LoadingController,
    public formbuilder: FormBuilder, private alertCtrl: AlertController, private variableManagementService: VariableManagementService, private fireStore: AngularFirestore, private storageService: IonicStorageService) {  
    this.formgroup = this.formbuilder.group(
      {
        email: new FormControl('', Validators.compose([Validators.required, Validators.email])), 
        password: new FormControl('', Validators.compose([Validators.required, Validators.minLength(6),PasswordStrengthValidator.isValid]))
      }
    );
   }

  ngOnInit() {}

  onSubmit(){
    if(!this.formgroup.valid) {
      return;
    }
    //If the form is valid, the email and password properties are extracted.
    const email = this.formgroup.value['email'];
    const password = this.formgroup.value['password'];
    this.onLogin(email, password);
  }

  onLogin(email: string, password: string) {
    this.isLoading = true;
    this.loadingCtrl
      .create({ keyboardClose: true, message: 'Logging in...' })
      .then(loadingEl => {
        loadingEl.present();
        //To fetch the AuthResponseData asynchronously, Observable is used here.
        let authObs: Observable<AuthResponseData>;  
        if (this.isLogin) {
          authObs = this.authService.login(email, password);
        }
        //Data is fetched when subscriber function is executed.
        authObs.subscribe(authResData => {
            this.isLoading = false;
            loadingEl.dismiss();
            console.log('Logged in!');
            this.authService.fetchServerIPs(authResData.localId).subscribe(resData => {
              console.log(resData)
              if(resData) {
                this.router.navigateByUrl('/dashboard/monitoring');
              }
            });
          },
          //In case of errors while logging in, custom error messages are displayed.
          errRes => {
            loadingEl.dismiss();
            console.log(errRes);  
            const code = errRes.error.error.message;
            let message = 'Could not log you in. Try again.';
             if (code === 'EMAIL_NOT_FOUND') {
              message = 'E-Mail address could not be found.';
            } else if (code === 'INVALID_PASSWORD') {
              message = 'This password is not correct.';
            }
            this.showAlert(message);
          }
        );
      });
  }

  //Alert box display function.
  private showAlert(message: string) {
    this.alertCtrl
      .create({
        header: 'Authentication failed',
        message: message,
        buttons: ['Okay']
      })
      .then(alertEl => alertEl.present());
  }
 
  //Navigated to the Signup Page when Sign Up option is selected.
  signUp() {
    this.router.navigateByUrl('/register')
  }  
}
 
  

