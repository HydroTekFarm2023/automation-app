import { Component, OnInit, ViewChild } from '@angular/core';
import {Chart} from 'chart.js';
import {ChartDataSets} from 'chart.js';

import { VariableManagementService } from 'src/app/variable-management.service';
import { Variable } from '@angular/compiler/src/render3/r3_ast';
import { Label } from 'ng2-charts';
import { ChartsModule } from 'ng2-charts';
import * as moment from 'moment';
import { ModalController } from '@ionic/angular';
import { AddSystemPage } from 'src/app/add-system/add-system.page';
import { AddGrowroomPage } from 'src/app/add-growroom/add-growroom.page';
import { skipWhile, filter } from 'rxjs/operators';

import DownsamplePlugin from 'chartjs-plugin-downsample';

@Component({
  selector: 'app-visualization',
  templateUrl: './visualization.page.html',
  styleUrls: ['./visualization.page.scss'],
})

export class VisualizationPage implements OnInit {
  componentDidMount() {
    Chart.plugins.register(DownsamplePlugin);
  }
  
  today: string;
  startDate:string=new Date().toString();
  endDate:string=new Date().toString();
  deviceName: string;
  clusterName: string;
  selectedCluster:string;
  start_date:string;
  end_date:string;
  
  compareWith : any ;
  DefaultValue:string;
  disableDateTime:boolean;


  
  ph: boolean = true;
  ec: boolean = true;
  temperature: boolean = true;

  humidity: boolean = false;
  air_temperature: boolean = false;


  deviceAlertOptions: any = {
    header: "Device Name"
  }

  clusterAlertOptions: any = {
    header: "Cluster Name"
  } 

  options:any[]=[
    {
      id:0,
      name:'Custom Date'
    },
    {
      id:1,
      name:'Last Week'
    },
    {
      id:2,
      name:'Last Month'
    }
  ];

compareWithFn(o1, o2) {
  return o1 === o2;
};

dateChanged(date){
  this.start_date=moment(this.startDate).format("YYYY-MM-DDTHH:mm:ss");
  this.end_date=moment(this.endDate).format("YYYY-MM-DDTHH:mm:ss");
  
  this.onApply(this.clusterName,this.deviceName,this.start_date,this.end_date);   
}

onSelectedChange(event:any){
  console.log(event.target.value);

  if(event.target.value=="0")
  {
    this.disableDateTime=false;
    this.onApply(this.clusterName,this.deviceName,this.start_date,this.today);
  }

  else if(event.target.value=="1")
  {
    this.disableDateTime=true;
    this.start_date=moment(this.today).subtract(7,"days").format("YYYY-MM-DDTHH:mm:ss");
    this.today = moment(this.today).format("YYYY-MM-DDTHH:mm:ss");
    this.onApply(this.clusterName,this.deviceName,this.start_date,this.today);
  }
  else if(event.target.value=="2")
  {
    this.disableDateTime=true;
    this.start_date=moment(this.today).subtract(1,"month").format("YYYY-MM-DDTHH:mm:ss");
    this.today = moment(this.today).format("YYYY-MM-DDTHH:mm:ss");
    
    this.onApply(this.clusterName,this.deviceName,this.start_date,this.today);
  }
}



//ph
phData:ChartDataSets[]=[
  {data:[],label:'ph',borderColor: "#00EEFF",fill: false,lineTension:0,yAxisID:'ph'}]

phLabels: Label[];
phType = 'line';
Options:{
  downsample: {
  enabled: true,
  threshold:30,
      
  auto: false, 
  onInit: true,
      
  preferOriginalData: true,
  restoreOriginalData: false, 
  },
};
phOptions= {
  responsive: true,
  maintainAspectRatio: true,
  spanGaps: false,
  legend: {
    display: false
  },
  title: {
    display: true,
    text: 'ph sensor',
    fontColor: "white"
  },
  scales:{
          yAxes:[
            {
              id:'ph',
              type:'linear',
              position:'left',
              gridLines: {
                drawOnChartArea: false,
                color: "#FFFFFF"
              },
              ticks: {
                fontColor: "white",
                stepSize: 0.5,
            },
              scaleLabel: {
                display: true,
                labelString: 'ph scale',
                fontColor: "white"
              },
          },
          ],
          xAxes: [{
            gridLines: {
              drawOnChartArea: false,
              color: "#FFFFFF"
            },
            ticks: {
                fontColor: "white",
            },
        }]
        },
};




//ec
ecData:ChartDataSets[]=[
  {data:[],label:'ec',borderColor: "#FFF300",fill: false,lineTension:0,yAxisID:'ec'}]

ecLabels: Label[];
ecType = 'line';

ecOptions= {
  responsive: true,
  legend: {
    // labels: {
    //     fontColor: "white",
    // }
    display: false
  },
  title: {
    display: true,
    text: 'ec sensor',
    fontColor: "white"
  },
  scales:{
          yAxes:[
            {
              id:'ec',
              type:'linear',
              position:'left',
              gridLines: {
                drawOnChartArea: false,
                color: "#FFFFFF"
              },
              ticks: {
                fontColor: "white",
                stepSize: 0.5
            },
              scaleLabel: {
                display: true,
                labelString: 'ec scale',
                fontColor: "white"
              },
          },
          ],
          xAxes: [{
            gridLines: {
              drawOnChartArea: false,
              color: "#FFFFFF"
            },
            ticks: {
                fontColor: "white"
            }
        }]
        }, 
};


//temperature
tempData:ChartDataSets[]=[
  {data:[],label:'temperature',borderColor: "#FF4233",fill: false,lineTension:0,yAxisID:'temp'}]

tempLabels: Label[];
tempType = 'line';

tempOptions= {
  responsive: true,
  legend: {
    display: false
  },
  title: {
    display: true,
    text: 'temperature sensor (in °C)',
    fontColor: "white"
  },
  scales:{
          yAxes:[
            {
              id:'temp',
              type:'linear',
              position:'left',
              gridLines: {
                drawOnChartArea: false,
                color: "#FFFFFF"
              },
              
              scaleLabel: {
                display: true,
                labelString: 'temperature scale ',
                fontColor: "white"
              },
              ticks: {
                fontColor: "white",
                stepSize: 1,
              },
            }
          ],
          xAxes: [{
            gridLines: {
              drawOnChartArea: false,
              color: "#FFFFFF"
            },
            ticks: {
                fontColor: "white"
            }
        }]
        }, 
};

  constructor(public variableManagentService: VariableManagementService, private modalController: ModalController) {
    
    this.today = new Date().toString();

  }

  
  ngOnInit() {
    console.log('inside ngOnInit');
    this.variableManagentService.fetchClusters(false);
    
    // Update GrowRoom ID selection
    this.variableManagentService.selectedCluster.pipe(skipWhile(str => str == "")).subscribe(resData => {
      console.log("monitoring page selected cluster");
      this.clusterName = resData;
    });

    // Subscribe to changes in System ID
    this.variableManagentService.selectedDevice.pipe(skipWhile(str => str == "")).subscribe(resData => {
      console.log("monitoring page selected device");
      this.deviceName = resData;
      this.getData();
    });

    this.DefaultValue = "0" ;
    this.compareWith = this.compareWithFn;
    
    
  
    
    console.log(this.deviceName);
  
      

  }

  getData()
  {

    // console.log(this.clusterName);
    this.startDate=moment().format("YYYY-MM-DDTHH:mm:ss");
    this.endDate=moment().format("YYYY-MM-DDTHH:mm:ss");  
    
    this.start_date = this.startDate+'.000Z';
    this.end_date=  this.end_date+'.000Z';
    
    this.phData[0].data=[];
    this.ecData[0].data=[];
    this.tempData[0].data=[];
    
    //this.chartLabels =[];
    this.phLabels =[];
    this.ecLabels =[];
    this.tempLabels =[];


    this.variableManagentService.getAllSensorsData(this.clusterName,this.deviceName,this.start_date,this.end_date).subscribe(()=>{;
    
    this.phLabels = this.variableManagentService.sensorsTimeData;
    this.ecLabels = this.variableManagentService.sensorsTimeData;
    this.tempLabels = this.variableManagentService.sensorsTimeData;
    this.phData[0].data = this.variableManagentService.phValueData;
    this.ecData[0].data = this.variableManagentService.ecValueData;
    this.tempData[0].data = this.variableManagentService.tempValueData;
  });
  }

  // Change Device
  changeDevice(deviceName : string){
    console.log("change device");
    if(this.variableManagentService.selectedDevice.value != deviceName){
      this.variableManagentService.updateCurrentCluster(this.clusterName, deviceName);
    }
  }

  // Change Cluster
  changeCluster(clusterName: string){
    console.log("change cluster");
    this.variableManagentService.updateCurrentCluster(clusterName, null);
  }

  async onApply(clusterName:string,deviceName:string,newstartDate:string,newendDate:string){

      console.log("inside onApply");
      newstartDate = newstartDate+'.000Z';
      newendDate = newendDate+'.000Z';
      

      this.phData[0].data=[];
      this.ecData[0].data=[];
      this.tempData[0].data=[];
    
      //this.chartLabels =[];
      this.phLabels =[];
      this.ecLabels =[];
      this.tempLabels =[];

      this.variableManagentService.getAllSensorsData(this.clusterName,this.deviceName,newstartDate,newendDate).subscribe(()=>{
        
      console.log("after arrays are filled");
      this.phLabels = this.variableManagentService.sensorsTimeData;
      this.ecLabels = this.variableManagentService.sensorsTimeData;
      this.tempLabels = this.variableManagentService.sensorsTimeData;
      this.phData[0].data = this.variableManagentService.phValueData;
      this.ecData[0].data = this.variableManagentService.ecValueData;
      this.tempData[0].data = this.variableManagentService.tempValueData;
      });

      }


async presentGrowRoomModal() {
  const modal = await this.modalController.create({
    component: AddGrowroomPage,
  });
  return await modal.present();
}

async presentSystemModal() {
  const modal = await this.modalController.create({
    component: AddSystemPage,
  });
  return await modal.present();
}



}




