import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransportTransferStudentListComponent } from './transport-transfer-student-list.component';

describe('TransportTransferStudentListComponent', () => {
  let component: TransportTransferStudentListComponent;
  let fixture: ComponentFixture<TransportTransferStudentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransportTransferStudentListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransportTransferStudentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
