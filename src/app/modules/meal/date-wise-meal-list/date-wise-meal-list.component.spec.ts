import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateWiseMealListComponent } from './date-wise-meal-list.component';

describe('DateWiseMealListComponent', () => {
  let component: DateWiseMealListComponent;
  let fixture: ComponentFixture<DateWiseMealListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DateWiseMealListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DateWiseMealListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
