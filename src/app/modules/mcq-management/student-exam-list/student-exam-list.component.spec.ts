import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentExamListComponent } from './student-exam-list.component';

describe('StudentExamListComponent', () => {
  let component: StudentExamListComponent;
  let fixture: ComponentFixture<StudentExamListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentExamListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentExamListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
