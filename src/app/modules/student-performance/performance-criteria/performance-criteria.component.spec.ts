import { ComponentFixture, TestBed } from '@angular/core/testing';

import { performanceCriteriaComponent } from './performance-criteria.component';

describe('performanceCriteriaComponent', () => {
  let component: performanceCriteriaComponent;
  let fixture: ComponentFixture<performanceCriteriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ performanceCriteriaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(performanceCriteriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
