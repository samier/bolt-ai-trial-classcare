import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProxyTeachersTimetableComponent } from './proxy-teachers-timetable.component';

describe('ProxyTeachersTimetableComponent', () => {
  let component: ProxyTeachersTimetableComponent;
  let fixture: ComponentFixture<ProxyTeachersTimetableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProxyTeachersTimetableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProxyTeachersTimetableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
