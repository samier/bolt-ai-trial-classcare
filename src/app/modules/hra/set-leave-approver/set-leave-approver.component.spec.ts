import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetLeaveApproverComponent } from './set-leave-approver.component';

describe('SetLeaveApproverComponent', () => {
  let component: SetLeaveApproverComponent;
  let fixture: ComponentFixture<SetLeaveApproverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SetLeaveApproverComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetLeaveApproverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
