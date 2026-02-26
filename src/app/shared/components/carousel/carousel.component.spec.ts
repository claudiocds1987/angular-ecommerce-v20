import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarouselComponent } from './carousel.component';
import { Product } from '../../models/product.model';
import { ComponentRef } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

describe('CarouselComponent', () => {
  let component: CarouselComponent;
  let fixture: ComponentFixture<CarouselComponent>;
  let componentRef: ComponentRef<CarouselComponent>;

  const mockProducts: Product[] = [
    { id: 1, title: 'Product 1', price: 100, stock: 10, image: 'img1.jpg', category: 'cat1' },
    { id: 2, title: 'Product 2', price: 200, stock: 10, image: 'img2.jpg', category: 'cat1' },
    { id: 3, title: 'Product 3', price: 300, stock: 10, image: 'img3.jpg', category: 'cat1' },
    { id: 4, title: 'Product 4', price: 400, stock: 10, image: 'img4.jpg', category: 'cat1' },
    { id: 5, title: 'Product 5', price: 500, stock: 10, image: 'img5.jpg', category: 'cat1' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarouselComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CarouselComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    // Set input signal
    componentRef.setInput('products', mockProducts);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate maxIndex correctly', () => {
    // Usamos .set() asumiendo que itemsPerView es un signal
    component.itemsPerView.set(2);
    fixture.detectChanges(); // Importante para que los signals computados se actualicen

    // 5 products, 2 per view. Max index should be 3 (5 - 2)
    expect(component.maxIndex()).toBe(3);
  });

  it('should show controls when products > itemsPerView', () => {
    component.itemsPerView.set(2);
    fixture.detectChanges();
    expect(component.showControls()).toBeTrue();
  });

  it('should NOT show controls when products <= itemsPerView', () => {
    component.itemsPerView.set(5); // 5 products
    fixture.detectChanges();
    expect(component.showControls()).toBeFalse();
  });

  it('should navigate next and prev', () => {
    component.itemsPerView.set(1); // 1 per view, maxIndex = 4
    fixture.detectChanges();

    expect(component.currentIndex()).toBe(0);

    component.next();
    expect(component.currentIndex()).toBe(1);

    component.next();
    expect(component.currentIndex()).toBe(2);

    component.prev();
    expect(component.currentIndex()).toBe(1);
  });

  it('should not navigate past bounds', () => {
    component.itemsPerView.set(1);
    fixture.detectChanges();

    // Try going prev from 0
    component.prev();
    expect(component.currentIndex()).toBe(0);

    // Go to max
    const max = component.maxIndex();
    component.currentIndex.set(max);
    fixture.detectChanges();

    // Try going next
    component.next();
    expect(component.currentIndex()).toBe(max);
  });
});
