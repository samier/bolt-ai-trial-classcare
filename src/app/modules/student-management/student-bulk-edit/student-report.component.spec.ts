import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentBulkEditComponent } from './student-bulk-edit.component';

describe('StudentBulkEditComponent', () => {
  let component: StudentBulkEditComponent;
  let fixture: ComponentFixture<StudentBulkEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentBulkEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentBulkEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
