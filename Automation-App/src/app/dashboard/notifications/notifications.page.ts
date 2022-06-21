import { Router } from '@angular/router';
import { Component, OnInit, Output, EventEmitter, ViewChild  } from "@angular/core";
import { Notification } from 'src/app/models/notification.model';
import { IonInfiniteScroll } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';



@Component({
  selector: "app-notification",
  templateUrl: "./notifications.page.html",
  styleUrls: ["./notifications.page.scss"],
})
export class NotificationsPage implements OnInit {
  noNotifs: boolean = false;
  notifs: Notification[] = [];
  notifs2: Notification[] = [];
  notifsAmount: number;
  unopenedCounter: number;
  @Output() newItemEvent = new EventEmitter<number>();
  numTimesLeft = 5;  
  fun = 0;

  


  //see control page - ngOnInit about getting device settings and then getting topicID
  constructor(
    public router: Router, public actionSheetCtrl: ActionSheetController

  ) {}


 

  ngOnInit() {
    this.notifs = [{image: null, "date": new Date().toLocaleString().replace(/(.*)\D\d+/, '$1'), "buttonColor": '#d6ecff', "opened": false, "notifHeader": "Plant Health", "notifBody": "Your plant may have covid", "notifText": "To test for the COVID-19 virus, a health care provider takes a sample from the nose (nasopharyngeal swab), throat (throat swab) or saliva. The samples are then sent to a lab for testing. If you're coughing up sputum, that may be sent for testing. The FDA has authorized at-home tests for the COVID-19 virus."}, {"image": null, "date": new Date().toLocaleString().replace(/(.*)\D\d+/, '$1'), "buttonColor": '#d6ecff', "opened": false, "notifHeader": "Plant Health", "notifBody": "Your plant may have covid", "notifText": "To test for the COVID-19 virus, a health care provider takes a sample from the nose (nasopharyngeal swab), throat (throat swab) or saliva. The samples are then sent to a lab for testing. If you're coughing up sputum, that may be sent for testing. The FDA has authorized at-home tests for the COVID-19 virus."}, {"image": null, "date": new Date().toLocaleString().replace(/(.*)\D\d+/, '$1'), "buttonColor": '#d6ecff', "opened": false, "notifHeader": "Plant Health", "notifBody": "Your plant may have covid", "notifText": "To test for the COVID-19 virus, a health care provider takes a sample from the nose (nasopharyngeal swab), throat (throat swab) or saliva. The samples are then sent to a lab for testing. If you're coughing up sputum, that may be sent for testing. The FDA has authorized at-home tests for the COVID-19 virus."}, {"image": null, "date": new Date().toLocaleString().replace(/(.*)\D\d+/, '$1'), "buttonColor": '#d6ecff', "opened": false, "notifHeader": "Plant Health", "notifBody": "Your plant may have covid", "notifText": "To test for the COVID-19 virus, a health care provider takes a sample from the nose (nasopharyngeal swab), throat (throat swab) or saliva. The samples are then sent to a lab for testing. If you're coughing up sputum, that may be sent for testing. The FDA has authorized at-home tests for the COVID-19 virus."}, {"image": null, "date": new Date().toLocaleString().replace(/(.*)\D\d+/, '$1'), "buttonColor": '#d6ecff', "opened": false, "notifHeader": "Plant Health", "notifBody": "Your plant may have covid", "notifText": "To test for the COVID-19 virus, a health care provider takes a sample from the nose (nasopharyngeal swab), throat (throat swab) or saliva. The samples are then sent to a lab for testing. If you're coughing up sputum, that may be sent for testing. The FDA has authorized at-home tests for the COVID-19 virus."}]
    this.notifsAmount = this.notifs.length;
    console.log(this.notifsAmount)

    for(let i = 0; i < this.notifs.length; i++){
      if(this.notifs[i].image == null){
          this.notifs[i].image = "https://banner2.cleanpng.com/20180427/jxq/kisspng-royalty-free-copyright-valentine-s-day-heart-5ae38b80dfdf72.458658361524861824917.jpg";
      }

    }
    
    if(this.notifsAmount == 0){
      this.noNotifs = true;
    }

    let counter: number = 0;
    for(let i = 0; i < this.notifs.length; i++){
      if(this.notifs[i].opened == false){
        counter++;
      }
    }
    this.unopenedCounter = counter;
    
  }




  addNewItem(event: MouseEvent) {
    this.fun++;
    for(let i = 0; i < this.notifs.length; i++){
      if(this.notifs[i].opened == false){
        this.newItemEvent.emit(8);
        break;
      }
      
    }
    console.log('before notifs'+' '+this.notifsAmount+' '+'fun'+' '+this.fun);
    this.newItemEvent.emit(this.notifsAmount-this.fun);
    console.log('notifs'+' '+this.notifsAmount+' '+'fun'+' '+this.fun);
  }

  navigateToTab2(tabName : string, notifArray: Notification[], notification: Notification){     
    notification.buttonColor = '#FFFFFF';
    
    notification.opened = true;
    let counter: number = 0;
    for(let i = 0; i < notifArray.length; i++){
      if(notifArray[i].opened == false){
        counter++;
      }
    }
    this.unopenedCounter = counter;
    
    
    
    
    
    
    this.router.navigate(['/dashboard/notifications/clickedNotifications'], { 
      state: { notifi: notification} });
      
  }

  loadData(event) {  
    setTimeout(() => {   
      this.addNotifications();  
      this.numTimesLeft -= 1;  
      event.target.complete(); 
      let counter: number = 0;
    for(let i = 0; i < this.notifs.length; i++){
      if(this.notifs[i].opened == false){
        counter++;
      }
    }
    this.unopenedCounter = counter; 
    }, 500);  
  }  


  addNotifications() {  
    for (let i = 0; i < 10; i++) {  
      this.notifs.push({"image": null, "date": new Date().toLocaleString().replace(/(.*)\D\d+/, '$1'), "buttonColor": '#d6ecff', "opened": false, "notifHeader": "Plant Health", "notifBody": "Your plant may have covid", "notifText": "To test for the COVID-19 virus, a health care provider takes a sample from the nose (nasopharyngeal swab), throat (throat swab) or saliva. The samples are then sent to a lab for testing. If you're coughing up sputum, that may be sent for testing. The FDA has authorized at-home tests for the COVID-19 virus."});  
    }  
  
}


async openActionSheetController(notifArray: Notification[], notification: Notification){
  let actionSheet = await this.actionSheetCtrl.create({
    
    buttons: [
  
  {
    text: 'Delete Notification',
    handler: () => {
     let index = notifArray.indexOf(notification);
     let removed = notifArray.splice(index, 1);
     let counter: number = 0;
  for(let i = 0; i < notifArray.length; i++){
    if(notifArray[i].opened == false){
      counter++;
    }
  }
  this.unopenedCounter = counter;
    }

    
  }, 
  
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
}
