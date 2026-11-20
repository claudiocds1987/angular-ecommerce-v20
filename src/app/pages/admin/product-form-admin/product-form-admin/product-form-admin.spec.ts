import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ProductFormAdmin } from './product-form-admin';
import { ProductService } from '@features/products/services/product-service';
import { ProductExtraAttributeService } from '@features/products/services/product-extra-attribute-service';

describe('ProductFormAdmin', () => {
  let component: ProductFormAdmin;
  let fixture: ComponentFixture<ProductFormAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormAdmin],
      providers: [
        provideHttpClient(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { operation: 'create' },
              paramMap: { get: () => '1' },
            },
          },
        },
        {
          provide: ProductService,
          useValue: {
            getProductById: () => of({}),
            createProduct: () => of({}),
            updateProduct: () => of({}),
          },
        },
        {
          provide: ProductExtraAttributeService,
          useValue: {
            getExtraAttributesByCategory: () => of([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
