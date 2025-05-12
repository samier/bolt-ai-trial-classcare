import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeesReportsComponent } from './fees-reports.component';

describe('FeesReportsComponent', () => {
  let component: FeesReportsComponent;
  let fixture: ComponentFixture<FeesReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeesReportsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeesReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
