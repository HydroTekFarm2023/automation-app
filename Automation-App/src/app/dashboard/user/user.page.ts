import { Router } from '@angular/router';
import { Component, OnInit, Output, EventEmitter, ViewChild  } from "@angular/core";
import { Notification } from 'src/app/models/notification.model';
import { ActionSheetController } from '@ionic/angular';
import { MqttInterfaceService } from 'src/app/Services/mqtt-interface.service';
import { VariableManagementService } from 'src/app/Services/variable-management.service';
import { IonicStorageService } from 'src/app/Services/ionic-storage.service';
import { Platform } from '@ionic/angular';
import  { AuthService } from 'src/app/auth/auth.service';
import { AlertController } from '@ionic/angular';






//IMPORTANT: temporarily changed notifs from Notification model to standard array
@Component({
  selector: "app-notification",
  templateUrl: "./user.page.html",
  styleUrls: ["./user.page.scss"],
})
export class UserPage implements OnInit {
  darkMode: boolean;
  ios: boolean;



  


  //see control page - ngOnInit about getting device settings and then getting topicID
  constructor(
    public platform: Platform, public router: Router, public actionSheetCtrl: ActionSheetController, public variableManagementService: VariableManagementService, 
    public mqttService: MqttInterfaceService, public ionicStorageService: IonicStorageService, public authService: AuthService, public alertController: AlertController

  ) {}


 

  ngOnInit() {
    
    this.darkMode = JSON.parse(localStorage.getItem('darkMode'));
    console.log(this.darkMode);
  }

//toggles darkmode boolean value
  changeDarkMode(){
    if(!this.darkMode || this.darkMode == null ){
      this.darkMode = true;
      localStorage.setItem('darkMode',JSON.stringify(this.darkMode));
      console.log(this.darkMode);
      location.reload();
    }
    else{
      this.darkMode = false;
      localStorage.setItem('darkMode',JSON.stringify(this.darkMode));
      console.log(this.darkMode);
      location.reload();
    }
    
    
  }

  //triggers popup when users new password does not meet requirements
  errorPopUp(){


    this.alertController.create({
      header: "Error",
      subHeader: 'Your password must have at least 6 characters, a special character and an uppercase and lowercase character',

      
       buttons: [
        {
          text: 'Continue',
          handler: (alertData) => {},
        }
      ]
    }).then(res => {

      res.present();

    });

  }
  
  //alerts user that their password has successfully been updated
  passwordSuccess(){


    this.alertController.create({
      header: "Success!",
      subHeader: 'Your password has succesfuly been changed',

      
       buttons: [
        {
          text: 'Continue',
          handler: (alertData) => {
            this.authService.logout();
          },
        }
      ]
    }).then(res => {

      res.present();

    });

  }

  //alerts user that their password has successfully been updated
  deleteSuccess(){


    this.alertController.create({
      header: "Success!",
      subHeader: 'Your has successfully been deleted',

      
       buttons: [
        {
          text: 'Continue',
          handler: (alertData) => {},
        }
      ]
    }).then(res => {

      res.present();

    });

  }





//function for changing the users password
  changePassword(){

    this.alertController.create({
      subHeader: 'Please enter your username, current password and new password',
      inputs: [
        {
          name: 'email',
          placeholder: 'email'
        },
        {
          name: 'currentPassword',
          placeholder: 'current password',
          type: 'password'
        },
        {
          name: 'newPassword',
          placeholder: 'new password',
          type: 'password'
        }

      ],
      
       buttons: [
        {
          text: 'Continue',
          handler: (alertData) => {
            //Subscribe
            let num = /[0-9]/;
            let alpha = /[a-z]/;
            let cap = /[A-Z]/;
            let sym = /[@#$%^&*]/;
        if(alertData.newPassword.length >= 6){
        if(num.test(alertData.newPassword)){
          if (alpha.test(alertData.newPassword)){
            if (cap.test(alertData.newPassword)){
              if(sym.test(alertData.newPassword)){
            
            console.log(alertData.currentPassword);
            console.log(alertData.newPassword);
            console.log(alertData.email);
            this.authService.resetPassword(alertData.newPassword, alertData.currentPassword, alertData.email).subscribe(
              resData => {
                console.log(resData);
              }
            )
            this.passwordSuccess();
            }
            else{this.errorPopUp();}
          }
          else{this.errorPopUp();}
        }
        else{this.errorPopUp();}
      }
        else{this.errorPopUp();}
        }
        else{this.errorPopUp();}
        },
        },
        {
          text: 'Cancel',
          handler: () => {
          
          },
        },
      ]
    }).then(res => {

      res.present();

    });
  }

//function for deleting the user account
  deleteAccountPopUp(){

    this.alertController.create({
      header: "Delete account",
      subHeader: 'Are you sure you want to delete your account? Once done it is irreversible.',
       buttons: [
        {
          text: 'Continue',
          handler: (alertData) => {

      
            this.authService.delete().subscribe(
              resData => {
                console.log(resData);
              }
            )
            
            this.deleteSuccess();
       
        },
        },

        {
          text: 'Cancel',
          handler: () => {
          
          },
        },



      ]
    }).then(res => {

      res.present();

    });
  }

 

  
}

