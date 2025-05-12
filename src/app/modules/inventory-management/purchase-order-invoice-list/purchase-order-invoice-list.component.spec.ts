import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderInvoiceListComponent } from './purchase-order-invoice-list.component';

describe('PurchaseOrderInvoiceListComponent', () => {
  let component: PurchaseOrderInvoiceListComponent;
  let fixture: ComponentFixture<PurchaseOrderInvoiceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PurchaseOrderInvoiceListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderInvoiceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
