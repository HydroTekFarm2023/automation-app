
import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";


@Component({
  selector: 'app-item-detail',
  templateUrl: "./clickedNotifications.page.html",
  styleUrls: ["./clickedNotifications.page.scss"],
})
export class clickedNotificationsPage implements OnInit {

isClicked: boolean = true;
notification = history.state.example;



  //see control page - ngOnInit about getting device settings and then getting topicID
  constructor(private router: Router) {
   
  }
 
  ngOnInit() {
 console.log(window.history.state); 
 
 
}

navigateToTab(){     
  
  
  this.router.navigate(['/dashboard/notifications/']);
    
}




  

 
}
