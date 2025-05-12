import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollVoteStudentComponent } from './poll-vote-student.component';

describe('PollVoteStudentComponent', () => {
  let component: PollVoteStudentComponent;
  let fixture: ComponentFixture<PollVoteStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PollVoteStudentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PollVoteStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
