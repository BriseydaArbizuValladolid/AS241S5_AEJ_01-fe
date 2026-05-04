import { TestBed } from '@angular/core/testing';

import { ApiUno } from './api-uno';

describe('ApiUno', () => {
  let service: ApiUno;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiUno);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
