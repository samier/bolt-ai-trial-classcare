import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeesReceiptNoComponent } from './fees-receipt-no.component';

describe('FeesReceiptNoComponent', () => {
  let component: FeesReceiptNoComponent;
  let fixture: ComponentFixture<FeesReceiptNoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeesReceiptNoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeesReceiptNoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
