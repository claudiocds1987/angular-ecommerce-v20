import { TestBed } from '@angular/core/testing';

import { ProductGraphqlService } from './product-graphql-service';

describe('ProductGraphqlService', () => {
  let service: ProductGraphqlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductGraphqlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
