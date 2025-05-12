import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacultyLeaveEditFormComponent } from './faculty-leave-edit-form.component';

describe('FacultyLeaveEditFormComponent', () => {
  let component: FacultyLeaveEditFormComponent;
  let fixture: ComponentFixture<FacultyLeaveEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FacultyLeaveEditFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacultyLeaveEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
