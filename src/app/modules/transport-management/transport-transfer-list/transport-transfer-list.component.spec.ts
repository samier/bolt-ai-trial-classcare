import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransportTransferListComponent } from './transport-transfer-list.component';

describe('TransportTransferListComponent', () => {
  let component: TransportTransferListComponent;
  let fixture: ComponentFixture<TransportTransferListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransportTransferListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransportTransferListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
