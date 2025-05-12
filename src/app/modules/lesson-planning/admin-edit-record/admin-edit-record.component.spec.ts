import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEditRecordComponent } from './admin-edit-record.component';

describe('AdminEditRecordComponent', () => {
  let component: AdminEditRecordComponent;
  let fixture: ComponentFixture<AdminEditRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminEditRecordComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminEditRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
