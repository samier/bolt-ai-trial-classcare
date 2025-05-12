import { ComponentFixture, TestBed } from '@angular/core/testing';

import { studentRoomComponent } from './student-room.component';

describe('studentRoomComponent', () => {
  let component: studentRoomComponent;
  let fixture: ComponentFixture<studentRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ studentRoomComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(studentRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
