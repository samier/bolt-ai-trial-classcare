import { TestBed } from '@angular/core/testing';

import { certificateService } from './certificate.service';

describe('certificateService', () => {
  let service: certificateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(certificateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
