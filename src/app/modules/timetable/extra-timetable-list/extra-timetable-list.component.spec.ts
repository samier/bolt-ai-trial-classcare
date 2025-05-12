import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtraTimetableListComponent } from './extra-timetable-list.component';

describe('ExtraTimetableListComponent', () => {
  let component: ExtraTimetableListComponent;
  let fixture: ComponentFixture<ExtraTimetableListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExtraTimetableListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtraTimetableListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
