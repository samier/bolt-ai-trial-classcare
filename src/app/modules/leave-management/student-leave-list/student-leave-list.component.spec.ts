import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentLeaveListComponent } from './student-leave-list.component';

describe('StudentLeaveListComponent', () => {
  let component: StudentLeaveListComponent;
  let fixture: ComponentFixture<StudentLeaveListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentLeaveListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentLeaveListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
