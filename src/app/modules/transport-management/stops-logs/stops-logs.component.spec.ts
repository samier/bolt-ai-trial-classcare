import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StopsLogsComponent } from './stops-logs.component';

describe('StopsLogsComponent', () => {
  let component: StopsLogsComponent;
  let fixture: ComponentFixture<StopsLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StopsLogsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StopsLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
