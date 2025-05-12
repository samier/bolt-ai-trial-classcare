import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollResultDetailComponent } from './poll-result-detail.component';

describe('PollResultDetailComponent', () => {
  let component: PollResultDetailComponent;
  let fixture: ComponentFixture<PollResultDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PollResultDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PollResultDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
