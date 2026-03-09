import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsGridAdmin } from './products-grid-admin';

describe('ProductsGridAdmin', () => {
  let component: ProductsGridAdmin;
  let fixture: ComponentFixture<ProductsGridAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsGridAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductsGridAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
