import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeesCategoryComponent } from './fees-category-list.component';

describe('FeesCategoryComponent', () => {
  let component: FeesCategoryComponent;
  let fixture: ComponentFixture<FeesCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeesCategoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeesCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
