import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeesReceiptListComponent } from './fees-receipt-no-list.component';

describe('FeesReceiptListComponent', () => {
  let component: FeesReceiptListComponent;
  let fixture: ComponentFixture<FeesReceiptListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeesReceiptListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeesReceiptListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
