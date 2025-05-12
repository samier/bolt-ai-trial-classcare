import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StopsLogsDetailComponent } from './stops-logs-detail.component';

describe('StopsLogsDetailComponent', () => {
  let component: StopsLogsDetailComponent;
  let fixture: ComponentFixture<StopsLogsDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StopsLogsDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StopsLogsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
