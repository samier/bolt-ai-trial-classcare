import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignPayrollgroupToRoleComponent } from './assign-payrollgroup-to-role.component';

describe('AssignPayrollgroupToRoleComponent', () => {
  let component: AssignPayrollgroupToRoleComponent;
  let fixture: ComponentFixture<AssignPayrollgroupToRoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignPayrollgroupToRoleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignPayrollgroupToRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
