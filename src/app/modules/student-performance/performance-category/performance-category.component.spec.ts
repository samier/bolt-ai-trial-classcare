import { ComponentFixture, TestBed } from '@angular/core/testing';

import { performanceCategoryComponent } from './performance-category.component';

describe('performanceCategoryComponent', () => {
  let component: performanceCategoryComponent;
  let fixture: ComponentFixture<performanceCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ performanceCategoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(performanceCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
