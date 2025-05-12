import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPayrollCategoryComponent } from './add-payroll-category.component';

describe('AddPayrollCategoryComponent', () => {
  let component: AddPayrollCategoryComponent;
  let fixture: ComponentFixture<AddPayrollCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddPayrollCategoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPayrollCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
