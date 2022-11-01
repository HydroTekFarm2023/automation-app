import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PoTestingComponent } from './po-testing.component';

describe('PoTestingComponent', () => {
  let component: PoTestingComponent;
  let fixture: ComponentFixture<PoTestingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PoTestingComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PoTestingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
