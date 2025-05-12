import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollGroupListComponent } from './payroll-group-list.component';

describe('PayrollGroupListComponent', () => {
  let component: PayrollGroupListComponent;
  let fixture: ComponentFixture<PayrollGroupListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayrollGroupListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayrollGroupListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
