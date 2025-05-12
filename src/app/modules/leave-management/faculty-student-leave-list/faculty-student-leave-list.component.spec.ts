import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacultyStudentLeaveListComponent } from './faculty-student-leave-list.component';

describe('FacultyStudentLeaveListComponent', () => {
  let component: FacultyStudentLeaveListComponent;
  let fixture: ComponentFixture<FacultyStudentLeaveListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FacultyStudentLeaveListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacultyStudentLeaveListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
