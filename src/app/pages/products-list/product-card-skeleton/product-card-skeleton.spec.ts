import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductCardSkeleton } from './product-card-skeleton';

describe('ProductCardSkeleton', () => {
  let component: ProductCardSkeleton;
  let fixture: ComponentFixture<ProductCardSkeleton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCardSkeleton],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCardSkeleton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
