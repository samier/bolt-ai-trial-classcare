import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacultyAddStudentLeaveComponent } from './faculty-add-student-leave.component';

describe('FacultyAddStudentLeaveComponent', () => {
  let component: FacultyAddStudentLeaveComponent;
  let fixture: ComponentFixture<FacultyAddStudentLeaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FacultyAddStudentLeaveComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacultyAddStudentLeaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
