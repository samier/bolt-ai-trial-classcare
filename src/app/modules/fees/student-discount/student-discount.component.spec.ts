import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentDiscountComponent } from './student-discount.component';

describe('StudentDiscountComponent', () => {
  let component: StudentDiscountComponent;
  let fixture: ComponentFixture<StudentDiscountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentDiscountComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentDiscountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
