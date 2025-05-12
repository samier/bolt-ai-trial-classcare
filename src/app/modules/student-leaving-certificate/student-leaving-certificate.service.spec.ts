import { TestBed } from '@angular/core/testing';

import { StudentLeavingCertificateService } from './student-leaving-certificate.service';

describe('StudentLeavingCertificateService', () => {
  let service: StudentLeavingCertificateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentLeavingCertificateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
