import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import {HttpClientModule} from '@angular/common/http';
import { ComponentsModule } from './components/components.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts';
<<<<<<< HEAD
import { VariableManagementService } from './variable-management.service';
=======
import { DatePipe } from '@angular/common';

>>>>>>> 8d32ac044289f768f41b313f243eeb5a796b36f1
@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, HttpClientModule, IonicModule.forRoot(), AppRoutingModule, ComponentsModule, FormsModule, ReactiveFormsModule,ChartsModule],
  providers: [
    VariableManagementService,
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
