import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentRequisitionListComponent } from './student-requisition-list.component';

describe('StudentRequisitionListComponent', () => {
  let component: StudentRequisitionListComponent;
  let fixture: ComponentFixture<StudentRequisitionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentRequisitionListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentRequisitionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
