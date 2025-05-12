import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacultyTimetableComponent } from './faculty-timetable.component';

describe('FacultyTimetableComponent', () => {
  let component: FacultyTimetableComponent;
  let fixture: ComponentFixture<FacultyTimetableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FacultyTimetableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacultyTimetableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
