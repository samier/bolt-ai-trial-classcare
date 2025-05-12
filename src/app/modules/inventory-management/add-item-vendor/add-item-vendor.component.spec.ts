import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddItemVendorComponent } from './add-item-vendor.component';

describe('AddItemVendorComponent', () => {
  let component: AddItemVendorComponent;
  let fixture: ComponentFixture<AddItemVendorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddItemVendorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddItemVendorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
