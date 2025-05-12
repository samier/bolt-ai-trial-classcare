import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentLeaveEditFormComponent } from './student-leave-edit-form.component';

describe('StudentLeaveEditFormComponent', () => {
  let component: StudentLeaveEditFormComponent;
  let fixture: ComponentFixture<StudentLeaveEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentLeaveEditFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentLeaveEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
