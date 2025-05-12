import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveTypeListComponent } from './leave-type-list.component';

describe('LeaveTypeListComponent', () => {
  let component: LeaveTypeListComponent;
  let fixture: ComponentFixture<LeaveTypeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaveTypeListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveTypeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
