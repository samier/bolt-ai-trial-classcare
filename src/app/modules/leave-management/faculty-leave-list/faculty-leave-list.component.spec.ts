import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacultyLeaveListComponent } from './faculty-leave-list.component';

describe('FacultyLeaveListComponent', () => {
  let component: FacultyLeaveListComponent;
  let fixture: ComponentFixture<FacultyLeaveListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FacultyLeaveListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacultyLeaveListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
