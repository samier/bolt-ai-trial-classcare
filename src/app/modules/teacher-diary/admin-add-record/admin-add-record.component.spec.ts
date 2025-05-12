import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAddRecordComponent } from './admin-add-record.component';

describe('AdminAddRecordComponent', () => {
  let component: AdminAddRecordComponent;
  let fixture: ComponentFixture<AdminAddRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminAddRecordComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAddRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
