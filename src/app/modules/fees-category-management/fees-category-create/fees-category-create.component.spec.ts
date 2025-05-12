import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeesCategoryCreateComponent } from './fees-category-create.component';

describe('FeesCategoryCreateComponent', () => {
  let component: FeesCategoryCreateComponent;
  let fixture: ComponentFixture<FeesCategoryCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeesCategoryCreateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeesCategoryCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
