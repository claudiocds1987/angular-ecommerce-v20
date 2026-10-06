import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { signal, provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';

import { Cart } from './cart';
import { CartService } from '@features/checkout/services/cart-service';
import { OrderService } from '@features/checkout/services/order-service';
import { ConfirmDialogService } from '@shared/components/confirm-dialog/confirm-dialog.service';
import { AuthStore } from '@features/auth/state/auth.store';

describe('Cart', () => {
  let component: Cart;
  let fixture: ComponentFixture<Cart>;
  let mockCartService: any;

  beforeEach(async () => {
    mockCartService = {
      cart: signal([]),
      totalPrice: signal(0),
    };

    const mockAuthStore = {
      user: signal(null),
    };

    const mockOrderService = {
      createOrder: () => of({ initPoint: 'http://test' }),
    };

    const mockConfirmDialogService = {
      open: () => of(true),
    };

    await TestBed.configureTestingModule({
      imports: [Cart],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideNoopAnimations(),
        { provide: CartService, useValue: mockCartService },
        { provide: AuthStore, useValue: mockAuthStore },
        { provide: OrderService, useValue: mockOrderService },
        { provide: ConfirmDialogService, useValue: mockConfirmDialogService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Cart);
    component = fixture.componentInstance;
  });

  it('should create', async () => {
    await fixture.whenStable();
    expect(component).toBeTruthy();
  });

  it('should display empty cart message when cart is empty', async () => {
    await fixture.whenStable();
    const emptyMessage = fixture.nativeElement.textContent;
    expect(emptyMessage).toContain('Tu carrito está completamente vacío');
  });

  it('should display items when cart has products', async () => {
    // ACT: Add an item to the mock cart signal
    mockCartService.cart.set([
      { id: 1, title: 'Test Product', quantity: 2, price: 100 }
    ]);
    mockCartService.totalPrice.set(200);

    // WAIT for the asynchronous update to complete
    await fixture.whenStable();

    // ASSERT the DOM has been updated
    const htmlContent = fixture.nativeElement.innerHTML;
    expect(htmlContent).not.toContain('Tu carrito está completamente vacío');
    expect(fixture.nativeElement.textContent).toContain('Test Product');
  });
});
