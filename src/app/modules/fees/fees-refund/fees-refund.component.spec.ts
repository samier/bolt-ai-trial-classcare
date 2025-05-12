import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeesRefundComponent } from './fees-refund.component';

describe('FeesRefundComponent', () => {
  let component: FeesRefundComponent;
  let fixture: ComponentFixture<FeesRefundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeesRefundComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeesRefundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
