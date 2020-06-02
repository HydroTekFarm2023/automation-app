import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { WarningsPage } from './warnings.page';

describe('WarningsPage', () => {
  let component: WarningsPage;
  let fixture: ComponentFixture<WarningsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WarningsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(WarningsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
