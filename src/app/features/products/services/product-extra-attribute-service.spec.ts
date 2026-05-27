import { TestBed } from '@angular/core/testing';

import { ProductExtraAttributeService } from './product-extra-attribute-service';

describe('ProductExtraAttributeService', () => {
  let service: ProductExtraAttributeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductExtraAttributeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
