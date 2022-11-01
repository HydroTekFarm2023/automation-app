import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PumpTestingComponent } from './pump-testing.component';

describe('PumpTestingComponent', () => {
  let component: PumpTestingComponent;
  let fixture: ComponentFixture<PumpTestingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PumpTestingComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PumpTestingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
