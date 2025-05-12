import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollShowResultComponent } from './poll-show-result.component';

describe('PollShowResultComponent', () => {
  let component: PollShowResultComponent;
  let fixture: ComponentFixture<PollShowResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PollShowResultComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PollShowResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
