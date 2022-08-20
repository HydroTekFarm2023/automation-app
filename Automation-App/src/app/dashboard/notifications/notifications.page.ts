import { Router } from '@angular/router';
import { Component, OnInit, Output, EventEmitter, ViewChild  } from "@angular/core";
import { Notification } from 'src/app/models/notification.model';
import { IonInfiniteScroll } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { MqttInterfaceService } from 'src/app/Services/mqtt-interface.service';
import { VariableManagementService } from 'src/app/Services/variable-management.service';
import { Title } from '@angular/platform-browser';
import { IonicStorageService } from 'src/app/Services/ionic-storage.service';
import { Capacitor } from '@capacitor/core';
import { NotificationThermal } from 'src/app/models/notification-thermal.model';



//IMPORTANT: temporarily changed notifs from Notification model to standard array
@Component({
  selector: "app-notification",
  templateUrl: "./notifications.page.html",
  styleUrls: ["./notifications.page.scss"],
})
export class NotificationsPage implements OnInit {
  noNotifs: boolean = true; 
  loaded: boolean = false;
  notifs = history.state.notifArray;
  unopenedCounter: number = 0;
  numTimesLeft = 5;  
  notifsLoaded = 8;
  readCounter = 0;


  


  //see control page - ngOnInit about getting device settings and then getting topicID
  constructor(
    public router: Router, public actionSheetCtrl: ActionSheetController, public variableManagementService: VariableManagementService, 
    public mqttService: MqttInterfaceService, public ionicStorageService: IonicStorageService

  ) {}


 

  ngOnInit() {
    this.variableManagementService.getNotifications(this.notifsLoaded).subscribe(notificationsArray => {
      this.notifs = notificationsArray;  
      if(this.notifs.length != 0){
        this.noNotifs = false;
      }
      
      
    });
    let loggedNotification = JSON.parse(localStorage.getItem('loggedInfo'));
   
    
  }

  
  

  //route to page for clicked notification
  notificationClicked(tabName : string, notifArray: Notification[], notification: Notification){  
    
    if(notification.isRead == false){
      this.readCounter++;
    }
   
    if(notification.isRead == false){
    notification.isRead = true;
    this.variableManagementService.notificationsUpdate.push(notification);
   
  }

    let counter: number = 0;
    for(let i = 0; i < notifArray.length; i++){
      if(!this.notifs[i].isRead && !this.notifs[i].isDeleted){
        counter++;
      }
    }
    this.variableManagementService.notificationClicked = notification;
    this.router.navigate(['/dashboard/notifications/clickedNotifications'], { queryParamsHandling: "preserve" });
    localStorage.setItem('loggedInfo',JSON.stringify(notification));
  }

//loads notifications when user scrolls down by resubscribing to mongodb  
  loadNotifications(event) {  
    setTimeout(() => {   
      this.addNotifications();  
      this.numTimesLeft -= 1;  
      event.target.complete(); 
      let counter: number = 0;
    for(let i = 0; i < this.notifs.length; i++){
      if(!this.notifs[i].isRead && !this.notifs[i].isDeleted){
        counter++;
      }
    }
    this.unopenedCounter = counter; 
    }, 500);  
  }  
  
  //resubsribe to mongodb to refresh notifications
  refreshNotifications(event){
    this.noNotifs = true;
    this.variableManagementService.getNotifications(8).subscribe(notificationsArray => {
      this.notifs = notificationsArray;
      this.updateDisplayedNotifications(this.notifs);
      if(this.notifs.length != 0){
        for(let z = 0; this.notifs.length; z++){
          if(this.notifs.length > 0){
          if(this.notifs[z].isDeleted == false){
            this.noNotifs = false;
            break;
          }
        }
       }
      }
    });
    //if user has deleted all notifications, refresh loads more
    for(let x = 0; x < this.notifs.length; x++){
    if(this.notifs[x].isDeleted = true){
      x++;
    }
    if(x == this.notifs.length){
      this.addNotifications();
      this.noNotifs = true;
      for(let y = 0; y < this.notifs.length; y++){
        if(this.notifs[y].isDeleted == false){
          this.noNotifs = false;  
        }
      }
    }
    }
    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 8000);
  }

  updateDisplayedNotifications(notifArray: Notification[]){
    for(let x = 0; x < this.variableManagementService.notificationsUpdate.length; x++){
      for(let y = 0; y < notifArray.length; y++){
        if(this.variableManagementService.notificationsUpdate[x]._id == notifArray[y]._id)
        {
          if(this.variableManagementService.notificationsUpdate[x].isRead == true){
          notifArray[y].isRead = true;
          }
          if(this.variableManagementService.notificationsUpdate[x].isDeleted == true){
            notifArray[y].isDeleted = true;
            }
        }
      }
  }
}

  //resubscribes to mongodb with larger getNotifications argument to load more notifications 
  addNotifications() {  
    this.notifsLoaded = this.notifsLoaded+4;
    this.variableManagementService.getNotifications(this.notifsLoaded).subscribe(notificationsArray => {
      this.notifs = notificationsArray;
      this.updateDisplayedNotifications(this.notifs);
      this.loaded = true;
    });
}

//menu presenting options for individual notifications
async openActionSheetController(notifArray: Notification[], notification: Notification){
  let actionSheet = await this.actionSheetCtrl.create({
    buttons: [{
    text: 'Delete Notification',
    handler: () => {
     let index = notifArray.indexOf(notification);
     let removed = notifArray.splice(index, 1);
     let counter: number = 0;
     notification.isDeleted = true;
  for(let i = 0; i < notifArray.length; i++){
    if(!this.notifs[i].isRead && !this.notifs[i].isDeleted){
      counter++;
    }}
  this.unopenedCounter = counter;
    }}, 
  {
    text: 'Cancel',
    handler: () => {
      let navTransition = actionSheet.dismiss();
      return false;
    }
  }]
  });
  actionSheet.present();    
}

//mark clicked notification as deleted
deleteNotification(notifArray: Notification[], notification: Notification){
  notification.isDeleted = true;
  this.variableManagementService.notificationsUpdate.push(notification);
}

// convert timestamp from notification into date format
convertDate(seconds: number){
  let theDate = new Date(seconds);
  return theDate;
}

}

