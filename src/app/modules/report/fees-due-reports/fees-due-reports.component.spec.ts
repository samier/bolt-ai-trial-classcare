import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeesDueReportsComponent } from './fees-due-reports.component';

describe('FeesDueReportsComponent', () => {
  let component: FeesDueReportsComponent;
  let fixture: ComponentFixture<FeesDueReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeesDueReportsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeesDueReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
