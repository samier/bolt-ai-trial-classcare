import { TestBed } from '@angular/core/testing';

import { WhatsappHistoryService } from './whatsapp-history.service';

describe('WhatsappHistoryService', () => {
  let service: WhatsappHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WhatsappHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
