import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollGroupViewComponent } from './payroll-group-view.component';

describe('PayrollGroupViewComponent', () => {
  let component: PayrollGroupViewComponent;
  let fixture: ComponentFixture<PayrollGroupViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayrollGroupViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayrollGroupViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
