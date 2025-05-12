import { ComponentFixture, TestBed } from '@angular/core/testing';

import { subjectComponent } from './subject-order.component';

describe('subjectComponent', () => {
  let component: subjectComponent;
  let fixture: ComponentFixture<subjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ subjectComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(subjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
