import { TestBed } from '@angular/core/testing';

import { IaChatService } from './ia-chat-service';

describe('IaChatService', () => {
  let service: IaChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IaChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
