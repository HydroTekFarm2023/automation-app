import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

   constructor(private router: Router){}

  ngOnInit() {}

  navigateToMonitoringTab() {
    this.router.navigate(['/dashboard/monitoring'], { queryParamsHandling: "preserve" });
  }

  navigateToControlTab() {
    this.router.navigate(['/dashboard/control'], { queryParamsHandling: "preserve" });
  }
}

   

  

