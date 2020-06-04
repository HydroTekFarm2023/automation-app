import { Component, OnInit } from '@angular/core';
import {AuthService} from '../auth/auth.service'; //used to trigger the onLogin method
import { Router } from '@angular/router'; //used to navigate through pages
import { FormControl} from '@angular/forms';
import {LoadingController, AlertController} from '@ionic/angular';
import { Validators, FormBuilder, FormGroup} from '@angular/forms';
import {PasswordStrengthValidator, PasswordMatch} from '../auth/password';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  form: FormGroup;
  
  isLoading = false; //set to false as a default.
  isSignup = true; //set to true as a default.
      //Parameters injected to trigger the necessary methods.
    constructor( private alertCtrl: AlertController, private authService: AuthService, private router : Router, private loadingCtrl: LoadingController, public formbuilder: FormBuilder) //Parameters injected to trigger the necessary methods
     {
      this.form = this.formbuilder.group(
        {
          email: new FormControl('', Validators.compose([Validators.required, Validators.email])),
          //A new formgroup is created for the passwords for proper retrieval and vaidation.
          passwordGroup: new FormGroup({
            password: new FormControl('', Validators.compose([Validators.required, Validators.minLength(6),PasswordStrengthValidator.isValid])),
            confirmpassword: new FormControl('', Validators.compose([Validators.required, PasswordStrengthValidator.isValid])),
          }, Validators.compose([PasswordMatch.MatchPassword]))
        }
      ); 
     }
  ngOnInit() {
  }
  onSubmit(){
      if (!this.form.valid) //Cannot proceed if the form is invalid.
      {
        return;
      }
      // If the form is valid, the email and password properties are extracted.
      const email = this.form.value['email'];
      const {password, confirmpassword} = this.form.value['passwordGroup'] ;
      this.onSignUp(email, password, confirmpassword);
  }
  onSignUp(email: string, password: string, confirmpassword: string)
  {
    this.isLoading = true;
    this.loadingCtrl.create({keyboardClose:true, message:'Creating account...'})
    .then(loadingEl=>{
      loadingEl.present();
      this.authService.signup(email, password, confirmpassword).subscribe(
        resData => {
          console.log(resData);
          this.isLoading = false;
          loadingEl.dismiss();
          console.log('Signed in!!')
          // this.router.navigateByUrl('/home');
        },
        //In case of errors while signing up, custom error messages are displayed.
        errRes => {
          loadingEl.dismiss();
          const code = errRes.error.error.message;
          let message = 'Could not sign you up, Try again.';
          if(code === 'EMAIL_EXISTS'){
            message = 'This email address already exists';
          }
          this.showAlert(message);
        }
      ); 
    })
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
  //Navigates back to Login page if user clicks on the Login option.
  onSwitch(){
        this.router.navigateByUrl('/auth')
  }
}
  
  



