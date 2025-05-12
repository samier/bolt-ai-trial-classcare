import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPayrollGroupComponent } from './add-payroll-group.component';

describe('AddPayrollGroupComponent', () => {
  let component: AddPayrollGroupComponent;
  let fixture: ComponentFixture<AddPayrollGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddPayrollGroupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPayrollGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
