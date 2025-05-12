import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderInvoiceFormComponent } from './purchase-order-invoice-form.component';

describe('PurchaseOrderInvoiceFormComponent', () => {
  let component: PurchaseOrderInvoiceFormComponent;
  let fixture: ComponentFixture<PurchaseOrderInvoiceFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PurchaseOrderInvoiceFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderInvoiceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
