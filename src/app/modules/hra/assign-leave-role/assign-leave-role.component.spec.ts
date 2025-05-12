import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignLeaveRoleComponent } from './assign-leave-role.component';

describe('AssignLeaveRoleComponent', () => {
  let component: AssignLeaveRoleComponent;
  let fixture: ComponentFixture<AssignLeaveRoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignLeaveRoleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignLeaveRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
