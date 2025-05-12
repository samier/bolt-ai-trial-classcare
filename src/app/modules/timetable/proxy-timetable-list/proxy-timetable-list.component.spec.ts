import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProxyTimetableListComponent } from './proxy-timetable-list.component';

describe('ProxyTimetableListComponent', () => {
  let component: ProxyTimetableListComponent;
  let fixture: ComponentFixture<ProxyTimetableListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProxyTimetableListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProxyTimetableListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
