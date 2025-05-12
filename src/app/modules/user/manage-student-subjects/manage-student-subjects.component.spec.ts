import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageStudentSubjectsComponent } from './manage-student-subjects.component';

describe('ManageStudentSubjectsComponent', () => {
  let component: ManageStudentSubjectsComponent;
  let fixture: ComponentFixture<ManageStudentSubjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageStudentSubjectsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageStudentSubjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
