/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ProductsList } from './products-list';
import { ProductService } from '../../shared/services/product-service';
import { IaChatService } from '../../shared/services/ia-chat-service';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { ProductFilterData } from '../../shared/models/product-filter-data.model';
import { DummyResponsePaginated, DummyProduct } from '../../shared/models/dummy-response.model';
import { provideZonelessChangeDetection } from '@angular/core';

type MockProductType = DummyProduct & { image: string };

type ServiceResponse = DummyResponsePaginated & {
  products: MockProductType[];
};

describe('ProductsList', () => {
  let component: ProductsList;
  let fixture: ComponentFixture<ProductsList>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;
  let iaChatServiceSpy: jasmine.SpyObj<IaChatService>;

  const createMockDummyProduct = (overrides: Partial<MockProductType> = {}): MockProductType => ({
    id: 1,
    title: 'Smartphone GTR',
    description: 'A premium smartphone',
    category: 'smartphones',
    price: 500,
    discountPercentage: 10,
    rating: 4.8,
    stock: 10,
    tags: ['tech'],
    brand: 'GTR',
    sku: 'GTR-001',
    weight: 1,
    dimensions: { width: 1, height: 1, depth: 1 },
    warrantyInformation: '1 year',
    shippingInformation: 'Ships in 1 day',
    availabilityStatus: 'In Stock',
    reviews: [],
    returnPolicy: '30 days',
    minimumOrderQuantity: 1,
    meta: { createdAt: '', updatedAt: '', barcode: '123', qrCode: 'qr' },
    thumbnail: 'https://example.com/phone.jpg',
    image: 'https://example.com/phone.jpg',
    images: ['https://example.com/phone.jpg'],
    ...overrides,
  });

  const mockResponse: ServiceResponse = {
    products: [createMockDummyProduct()],
    total: 1,
    skip: 0,
    limit: 30,
  };

  beforeEach(async () => {
    productServiceSpy = jasmine.createSpyObj('ProductService', [
      'getDummys',
      'getFilteredProducts',
      'getProductsCategoryList',
    ]);
    iaChatServiceSpy = jasmine.createSpyObj('IaChatService', ['showIAchat']);

    productServiceSpy.getDummys.and.returnValue(of(mockResponse as any));
    productServiceSpy.getFilteredProducts.and.returnValue(of(mockResponse as any));
    productServiceSpy.getProductsCategoryList.and.returnValue(of(['smartphones', 'laptops']));
    iaChatServiceSpy.showIAchat.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [ProductsList],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ProductService, useValue: productServiceSpy },
        { provide: IaChatService, useValue: iaChatServiceSpy },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsList);
    component = fixture.componentInstance;
  });

  it('should create and load initial products', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.products().length).toBe(1);
  });

  it('should handle filters', () => {
    fixture.detectChanges(); // Carga inicial

    const filters: ProductFilterData = {
      search: 'Smartphone',
      category: 'tech',
      sortBy: 'price',
      order: 'desc',
      minPrice: 0,
      maxPrice: 1000,
    };

    // 1. Limpiamos el historial
    productServiceSpy.getFilteredProducts.calls.reset();

    // 2. Ejecutamos el filtro
    component.handleFilter(filters);

    // 3. Forzamos la detección de cambios para que el efecto/suscripción se procese
    fixture.detectChanges();

    // 4. Verificamos
    expect(productServiceSpy.getFilteredProducts).toHaveBeenCalledWith(
      jasmine.any(Number), // limit (30)
      jasmine.any(Number), // skip (0)
      'Smartphone',
      'tech',
    );
  });

  it('should accumulate products when loadMore is called', () => {
    fixture.detectChanges(); // Primera carga (id: 1)

    const secondProduct = createMockDummyProduct({ id: 2, title: 'Laptop Pro' });
    const response: ServiceResponse = {
      total: 2,
      products: [secondProduct],
      skip: 30,
      limit: 30,
    };

    productServiceSpy.getFilteredProducts.and.returnValue(of(response as any));

    component.loadMore();
    fixture.detectChanges();

    // Verificamos que ahora hay 2 productos en el Signal
    expect(component.products().length).toBe(2);
  });

  it('should show empty state when no products are found', () => {
    fixture.detectChanges(); // Carga inicial exitosa

    const emptyResponse = { products: [], total: 0, skip: 0, limit: 30 };
    productServiceSpy.getFilteredProducts.and.returnValue(of(emptyResponse as any));

    component.handleFilter({
      search: 'NonExistent',
      category: '',
      sortBy: 'title',
      order: 'asc',
      minPrice: null,
      maxPrice: null,
    });

    fixture.detectChanges();

    const nativeElement = fixture.nativeElement;
    // Buscamos el texto directamente en el componente para mayor seguridad
    expect(nativeElement.textContent).toContain('No se encontraron productos');
  });
});
