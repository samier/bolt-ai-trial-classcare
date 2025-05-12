import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollListStudentComponent } from './poll-list-student.component';

describe('PollListStudentComponent', () => {
  let component: PollListStudentComponent;
  let fixture: ComponentFixture<PollListStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PollListStudentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PollListStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
