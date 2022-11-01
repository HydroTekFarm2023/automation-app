import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SensorTestingComponent } from './sensor-testing.component';

describe('SensorTestingComponent', () => {
  let component: SensorTestingComponent;
  let fixture: ComponentFixture<SensorTestingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SensorTestingComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SensorTestingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
