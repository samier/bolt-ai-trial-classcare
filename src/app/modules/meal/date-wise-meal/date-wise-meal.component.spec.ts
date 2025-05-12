import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateWiseMealComponent } from './date-wise-meal.component';

describe('DateWiseMealComponent', () => {
  let component: DateWiseMealComponent;
  let fixture: ComponentFixture<DateWiseMealComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DateWiseMealComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DateWiseMealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
