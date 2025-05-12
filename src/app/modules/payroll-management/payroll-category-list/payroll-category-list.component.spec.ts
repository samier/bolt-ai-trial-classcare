import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollCategoryListComponent } from './payroll-category-list.component';

describe('PayrollCategoryListComponent', () => {
  let component: PayrollCategoryListComponent;
  let fixture: ComponentFixture<PayrollCategoryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayrollCategoryListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayrollCategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
