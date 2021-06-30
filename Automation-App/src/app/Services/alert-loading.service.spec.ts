import { TestBed } from '@angular/core/testing';

import { AlertLoadingService } from './alert-loading.service';

describe('AlertLoadingServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AlertLoadingService = TestBed.get(AlertLoadingService);
    expect(service).toBeTruthy();
  });
});
