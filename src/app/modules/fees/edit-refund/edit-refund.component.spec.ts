import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRefundComponent } from './edit-refund.component';

describe('EditRefundComponent', () => {
  let component: EditRefundComponent;
  let fixture: ComponentFixture<EditRefundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditRefundComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditRefundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
