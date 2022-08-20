import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MqttInterfaceService } from '../Services/mqtt-interface.service';
import { VariableManagementService } from '../Services/variable-management.service';
import { Notification } from 'src/app/models/notification.model';
import { IonicStorageService } from '../Services/ionic-storage.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  title: String;
  unOpened: any;
  noNotifs = true;
  onNotification;
  notifs: Notification[] = [];
  notifs2: Notification[] = [];
  loaded: boolean = false;
  constructor(private router: Router, public mqttService: MqttInterfaceService, public variableManagementService: VariableManagementService, public ionicStorageService: IonicStorageService) { }

  ngOnInit() { //initial name
    
   
      this.variableManagementService.getNotificationsUnRead(5).subscribe(notificationsArray => {
        this.notifs2 = notificationsArray;
        this.loaded = true;
      
        if(this.notifs2.length != 0){
          this.noNotifs = false;
          this.unOpened = this.notifs2.length;
        }

        if(this.notifs2.length >10){
          
          this.unOpened = "10+";
        }        
      });
   
    let tempRoute = this.router.url.substr(11);
    if(tempRoute.indexOf('?') !== -1){ //if has query params, cut them out
      tempRoute = tempRoute.substr(0,tempRoute.indexOf('?'));
    }
    this.title = tempRoute[0].toUpperCase() + tempRoute.substr(1);
    this.onNotification = false;
  }

  navigateToTab(tabName : string){    
    if(tabName == "notifications"){
      this.onNotification = true;
    }
    this.router.navigate(['/dashboard/'+tabName], { queryParamsHandling: "preserve" });
    this.title = tabName[0].toUpperCase() + tabName.substr(1); // capitalize this  
  }



}
   

  

