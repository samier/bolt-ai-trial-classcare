import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAddNewRecordComponent } from './admin-add-new-record.component';

describe('AdminAddNewRecordComponent', () => {
  let component: AdminAddNewRecordComponent;
  let fixture: ComponentFixture<AdminAddNewRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminAddNewRecordComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAddNewRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
