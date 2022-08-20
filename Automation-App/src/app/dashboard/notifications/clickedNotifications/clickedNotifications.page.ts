import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { VariableManagementService } from "src/app/Services/variable-management.service";

@Component({
  selector: 'app-item-detail',
  templateUrl: "./clickedNotifications.page.html",
  styleUrls: ["./clickedNotifications.page.scss"],
})
export class clickedNotificationsPage implements OnInit {

isClicked: boolean = true;
notification;

  constructor(private router: Router, public variableManagementService: VariableManagementService) {
   
  }
 
  ngOnInit() {
    this.notification  = JSON.parse(localStorage.getItem('loggedInfo'));
  }

//navigate back to notifications menu after back-arrow button is clicked
navigateToTab(){     
  this.router.navigate(['/dashboard/notifications/']);
}

}
