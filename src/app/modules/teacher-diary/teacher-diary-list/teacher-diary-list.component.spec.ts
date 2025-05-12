import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherDiaryListComponent } from './teacher-diary-list.component';

describe('TeacherDiaryListComponent', () => {
  let component: TeacherDiaryListComponent;
  let fixture: ComponentFixture<TeacherDiaryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeacherDiaryListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherDiaryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
