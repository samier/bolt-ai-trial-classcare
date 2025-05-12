import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeesDiscountReportsComponent } from './fees-discount-reports.component';

describe('FeesDiscountReportsComponent', () => {
  let component: FeesDiscountReportsComponent;
  let fixture: ComponentFixture<FeesDiscountReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeesDiscountReportsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeesDiscountReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
