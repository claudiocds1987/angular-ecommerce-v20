import { TestBed } from '@angular/core/testing';
import { CartService } from './cart-service';
import { Product } from '../models/product.model';
import { Injector, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('CartService', () => {
  let service: CartService;

  const mockProduct: Product = {
    id: 1,
    title: 'Smartphone GTR',
    price: 500,
    finalPrice: 450,
    image: '',
    category: 'tech',
    stock: 10,
    rating: 5,
    discountPercentage: 10,
  };

  beforeEach(() => {
    // Limpieza total antes de empezar
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        CartService,
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(CartService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // --- PRUEBAS DE PERSISTENCIA CORREGIDAS ---

  it('should load initial data from localStorage if it exists', () => {
    // 1. Preparamos los datos en el storage REAL
    const mockData = [{ ...mockProduct, quantity: 3 }];
    localStorage.setItem('shopping_cart', JSON.stringify(mockData));

    // 2. Usamos Injector.create pasando directamente el objeto con 'providers'
    // Si el error persiste, es porque espera el array directamente como primer argumento
    const injector = Injector.create({
      providers: [
        { provide: CartService, useClass: CartService },
        // Aquí podrías añadir mocks si el servicio tuviera dependencias
      ],
      parent: TestBed.inject(Injector),
    });

    const freshService = injector.get(CartService);

    expect(freshService.cart().length).toBe(1);
    expect(freshService.cart()[0].quantity).toBe(3);
  });

  it('should sync with localStorage when cart changes', async () => {
    // 1. Espiamos el localStorage
    const setItemSpy = spyOn(localStorage, 'setItem').and.callThrough();

    // 2. Realizamos la acción
    service.addToCart(mockProduct);

    // 3. En lugar de tick o flushEffects, usamos una espera real de microtarea
    // Esto da tiempo a que el 'effect' de Angular se dispare en el hilo de ejecución
    await new Promise((resolve) => setTimeout(resolve, 0));

    // 4. Verificamos
    expect(setItemSpy).toHaveBeenCalledWith(
      'shopping_cart',
      jasmine.stringMatching('Smartphone GTR'),
    );
  });

  it('should start with an empty cart if storage is empty', () => {
    expect(service.cart().length).toBe(0);
  });

  it('should add a new product to the cart with quantity 1', () => {
    service.addToCart(mockProduct);
    expect(service.cart().length).toBe(1);
    expect(service.cart()[0].quantity).toBe(1);
  });

  it('should increment quantity if the product already exists', () => {
    service.addToCart(mockProduct);
    service.addToCart(mockProduct);
    expect(service.cart()[0].quantity).toBe(2);
  });

  it('should calculate totalPrice correctly', () => {
    service.addToCart(mockProduct);
    const secondProduct: Product = { ...mockProduct, id: 2, finalPrice: undefined, price: 100 };
    service.addToCart(secondProduct);
    expect(service.totalPrice()).toBe(550);
  });

  it('should update quantity correctly', () => {
    service.addToCart(mockProduct);
    service.updateQuantity(mockProduct.id, 5);
    expect(service.cart()[0].quantity).toBe(5);
  });

  it('should remove a product from the cart', () => {
    service.addToCart(mockProduct);
    service.removeFromCart(mockProduct.id);
    expect(service.cart().length).toBe(0);
  });

  it('should return true if an item is repeated', () => {
    service.addToCart(mockProduct);
    expect(service.checkItemsRepeated(mockProduct.id)).toBeTrue();
  });
});
