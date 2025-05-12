import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacultyEditStudentLeaveComponent } from './faculty-edit-student-leave.component';

describe('FacultyEditStudentLeaveComponent', () => {
  let component: FacultyEditStudentLeaveComponent;
  let fixture: ComponentFixture<FacultyEditStudentLeaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FacultyEditStudentLeaveComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacultyEditStudentLeaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
