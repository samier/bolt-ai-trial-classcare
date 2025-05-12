import { TestBed } from '@angular/core/testing';

import { HraService } from './hra.service';

describe('HraService', () => {
  let service: HraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
