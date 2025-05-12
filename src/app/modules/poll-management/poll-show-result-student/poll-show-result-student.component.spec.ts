import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollShowResultStudentComponent } from './poll-show-result-student.component';

describe('PollShowResultStudentComponent', () => {
  let component: PollShowResultStudentComponent;
  let fixture: ComponentFixture<PollShowResultStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PollShowResultStudentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PollShowResultStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
