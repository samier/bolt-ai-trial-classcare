import { ComponentFixture, TestBed } from '@angular/core/testing';

import { downloadTimetableComponent } from './download-timetable.component';

describe('downloadTimetableComponent', () => {
  let component: downloadTimetableComponent;
  let fixture: ComponentFixture<downloadTimetableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ downloadTimetableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(downloadTimetableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
