import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefundTypeComponent } from './refund-type.component';

describe('RefundTypeComponent', () => {
  let component: RefundTypeComponent;
  let fixture: ComponentFixture<RefundTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RefundTypeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RefundTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
