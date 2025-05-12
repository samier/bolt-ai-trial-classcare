import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherDiaryEditFormComponent } from './teacher-diary-edit-form.component';

describe('TeacherDiaryEditFormComponent', () => {
  let component: TeacherDiaryEditFormComponent;
  let fixture: ComponentFixture<TeacherDiaryEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeacherDiaryEditFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherDiaryEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
