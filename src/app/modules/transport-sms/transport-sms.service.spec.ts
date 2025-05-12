import { TestBed } from '@angular/core/testing';

import { TransportSmsService } from './transport-sms.service';

describe('TransportSmsService', () => {
  let service: TransportSmsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransportSmsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
