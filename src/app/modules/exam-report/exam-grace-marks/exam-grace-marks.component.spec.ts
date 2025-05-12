import { ComponentFixture, TestBed } from '@angular/core/testing';

import { examGraceMarksComponent } from './exam-grace-marks.component';

describe('examGraceMarksComponent', () => {
  let component: examGraceMarksComponent;
  let fixture: ComponentFixture<examGraceMarksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ examGraceMarksComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(examGraceMarksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
