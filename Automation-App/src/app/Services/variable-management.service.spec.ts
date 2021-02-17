import { TestBed } from '@angular/core/testing';

import { VariableManagementService } from './variable-management.service';

describe('VariableManagementService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VariableManagementService = TestBed.get(VariableManagementService);
    expect(service).toBeTruthy();
  });
});
