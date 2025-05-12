import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollCategoryViewComponent } from './payroll-category-view.component';

describe('PayrollCategoryViewComponent', () => {
  let component: PayrollCategoryViewComponent;
  let fixture: ComponentFixture<PayrollCategoryViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayrollCategoryViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayrollCategoryViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
