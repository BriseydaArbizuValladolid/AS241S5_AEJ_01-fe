import { TestBed } from '@angular/core/testing';

import { ApiUnoService } from './api-uno.service';

describe('ApiUno', () => {
  let service: ApiUnoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiUnoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
