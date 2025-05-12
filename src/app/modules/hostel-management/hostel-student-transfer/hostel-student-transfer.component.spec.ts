import { ComponentFixture, TestBed } from '@angular/core/testing';

import { hostelStudentTransferComponent } from './hostel-student-transfer.component';

describe('hostelStudentTransferComponent', () => {
  let component: hostelStudentTransferComponent;
  let fixture: ComponentFixture<hostelStudentTransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ hostelStudentTransferComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(hostelStudentTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
