import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLeaveEditFormComponent } from './admin-leave-edit-form.component';

describe('AdminLeaveEditFormComponent', () => {
  let component: AdminLeaveEditFormComponent;
  let fixture: ComponentFixture<AdminLeaveEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminLeaveEditFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminLeaveEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
