import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductFormAdmin } from './product-form-admin';

describe('ProductFormAdmin', () => {
  let component: ProductFormAdmin;
  let fixture: ComponentFixture<ProductFormAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductFormAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
