import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentRequisitionFormComponent } from './student-requisition-form.component';

describe('StudentRequisitionFormComponent', () => {
  let component: StudentRequisitionFormComponent;
  let fixture: ComponentFixture<StudentRequisitionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentRequisitionFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentRequisitionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
