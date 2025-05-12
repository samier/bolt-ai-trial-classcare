import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminStudentLeaveListTabComponent } from './admin-student-leave-list-tab.component';

describe('AdminStudentLeaveListTabComponent', () => {
  let component: AdminStudentLeaveListTabComponent;
  let fixture: ComponentFixture<AdminStudentLeaveListTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminStudentLeaveListTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminStudentLeaveListTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
