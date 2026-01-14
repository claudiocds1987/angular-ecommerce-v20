import { TestBed } from '@angular/core/testing';

import { IaSearchService } from './ia-search-service';

describe('IaSearchService', () => {
    let service: IaSearchService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(IaSearchService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
